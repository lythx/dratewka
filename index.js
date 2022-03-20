const SHORT_TIMEOUT = 100
const LONG_TIMEOUT = 1000
const IMPORTANT_TIMEOUT = 1000

let divs = {}

let state = {
    carry: 'none',
    dragonDead: false
}

class Start {

    isDisplayed = true
    audio

    constructor() {
        this.displayStart()
        this.audio = new Audio(`audio/hejnal.ogg`)
        this.audio.play()
        window.addEventListener('keydown', this.deleteStart)
    }

    displayStart = async () => {
        let div = document.createElement('div')
        div.id = 'startimg'
        div.classList.add('start')
        document.getElementById('wrapper').appendChild(div)
        await new Promise(r => setTimeout(r, 5000));
        if (!this.isDisplayed)
            return
        document.querySelector('.start').remove()
        div = document.createElement('div')
        div.id = 'starttext1'
        div.classList.add('start')
        document.getElementById('wrapper').appendChild(div)
        await new Promise(r => setTimeout(r, 20000));
        if (!this.isDisplayed)
            return
        document.querySelector('.start').remove()
        div = document.createElement('div')
        div.id = 'starttext2'
        div.classList.add('start')
        document.getElementById('wrapper').appendChild(div)
    }

    deleteStart = () => {
        this.isDisplayed = false
        this.audio.pause()
        document.querySelector('.start').remove()
        window.removeEventListener('keydown', this.deleteStart)
        document.getElementById('content').innerHTML = `  
        <div id="title"></div>
        <div id="img">
            <div id="imganimation"></div>
        </div>
        <div id="compass">
            <div class='compasshide' id='n'></div>
            <div class='compasshide' id='e'></div>
            <div class='compasshide' id='s'></div>
            <div class='compasshide' id='w'></div>
        </div>
        <div id="direction"></div>
        <div id="see"></div>
        <div id="items"></div>
        <div id="question"></div>
        <input type="text" id="write" autofocus='true'>`
        divs = {
            content: document.getElementById('content'),
            title: document.getElementById('title'),
            img: document.getElementById('img'),
            compass: document.getElementById('compass'),
            direction: document.getElementById('direction'),
            see: document.getElementById('see'),
            items: document.getElementById('items'),
            question: document.getElementById('question'),
            write: document.getElementById('write')
        }
        new Render(6, 3, 'none')
    }

}

class Location {
    x
    y
    title
    img
    color
    directions
    items = 'none'
    actions = 'none'
    constructor(x, y) {
        let loc = data[y][x]
        this.x = x
        this.y = y
        this.title = loc.title
        this.img = loc.img
        this.color = loc.color
        this.directions = loc.directions
        this.items = loc.items
        this.actions = loc.actions
    }
}

class Render extends Location {

    lastKey
    vocabularyDisplayed = false
    gossipsDisplayed = false

    constructor(x, y, carrying, direction) {
        super(x, y)
        state.carry = carrying
        this.generateHTML(direction)
        window.onkeydown = e => this.handleKeydown(e, x, y)
        divs.write.oninput = e => {
            let char = e.target.value[e.target.value.length - 1]
            if (!(/[a-zA-Z]/).test(this.lastKey) || this.lastKey.length != 1)
                return
            char = char.replace(/\w{1}/g, function (val) {
                return val === val.toLowerCase() ? val.toUpperCase() : val.toUpperCase();
            })
            e.target.value = e.target.value.substring(0, e.target.value.length - 1) + char
            this.prevInputLgt = divs.write.value.length
        }
    }

    generateHTML = async (direction) => {
        divs.write.value = ''
        divs.write.style.display = 'none'
        divs.question.innerHTML = `You are going ${direction}`
        if (divs.title.innerHTML != '')
            await this.imgAnimation()
        document.getElementById('imganimation').style.height = '0'
        divs.img.style.backgroundImage = `url('./img/${this.img}')`
        divs.img.style.backgroundColor = this.color
        await this.generateText()
        document.getElementById('write').focus()
    }

    generateText = async () => {
        divs.title.innerHTML = this.title
        await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        this.updateCompass()
        await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        divs.direction.innerHTML = this.getDirection()
        await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        divs.see.innerHTML = this.getSee()
        await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        divs.items.innerHTML = this.getItems()
        await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        divs.question.innerHTML = 'What now?'
        divs.write.style.display = 'initial'
        document.getElementById('write').focus()
        return
    }

    imgAnimation = async () => {
        document.getElementById('imganimation').style.backgroundImage = `url('./img/${this.img}')`
        document.getElementById('imganimation').style.backgroundColor = this.color
        let n = 0
        let lastRender = Date.now()
        const animate = () => {
            if (n > 100)
                return
            window.requestAnimationFrame(animate)
            if (Date.now() - lastRender < 30)
                return
            lastRender = Date.now()
            document.getElementById('imganimation').style.height = `${n}%`
            n += 4
        }
        window.requestAnimationFrame(animate)
        return await new Promise(r => setTimeout(r, LONG_TIMEOUT));
    }

    updateCompass = () => {
        const els = document.querySelectorAll('.compasshide')
        for (const e of els)
            e.style.background = 'var(--darkgray)'
        for (const e of this.directions)
            document.getElementById(e.toLowerCase()).style.background = 'none'
    }

    displayInfo = async (info) => {
        divs.write.value = ''
        divs.write.style.display = 'none'
        divs.question.innerHTML = info
        await new Promise(r => setTimeout(r, IMPORTANT_TIMEOUT))
        divs.see.innerHTML = this.getSee()
        divs.items.innerHTML = this.getItems()
        divs.question.innerHTML = 'What now?'
        divs.write.style.display = 'initial'
        divs.write.focus()
    }

    displayInfoWithTimeouts = async (info) => {
        divs.write.value = ''
        divs.write.style.display = 'none'
        divs.question.innerHTML = ''
        for (const line of info) {
            divs.question.innerHTML += line
            await new Promise(r => setTimeout(r, IMPORTANT_TIMEOUT))
        }
        divs.see.innerHTML = this.getSee()
        divs.items.innerHTML = this.getItems()
        divs.question.innerHTML = 'What now?'
        divs.write.style.display = 'initial'
        divs.write.focus()
    }

    getDirection = () => {
        let str = 'You can go'
        for (const [i, e] of this.directions.entries()) {
            str += i != 0 ? ', ' : ' '
            switch (e) {
                case 'W':
                    str += 'WEST'
                    break
                case 'N':
                    str += 'NORTH'
                    break
                case 'E':
                    str += 'EAST'
                    break
                case 'S':
                    str += 'SOUTH'
            }
        }
        return str
    }

    getSee = () => {
        let str = 'You see '
        if (this.items.length == 0)
            return `${str}nothing`
        for (const [i, item] of this.items.entries())
            str += i == 0 ? item.longName : `, ${item.longName}`
        return str
    }

    getItems = () => {
        return state.carry == 'none' ?
            `You are carrying nothing` :
            `You are carrying ${state.carry.longName}`
    }

    handleKeydown = async (e, x, y) => {
        if (this.vocabularyDisplayed) {
            this.deleteVocabulary()
            return
        }
        else if (this.gossipsDisplayed) {
            this.deleteGossips()
            return
        }
        this.lastKey = e.key
        if (e.key != 'Enter')
            return
        const query = divs.write.value
        if (query.split(' ').length == 1) {  //commands without parameter
            switch (query) {
                case 'W': case 'WEST':
                    if (this.title == "You are inside a dragon's cave"
                        && !state.dragonDead)
                        this.displayInfoWithTimeouts([
                            `You can't go that way...`,
                            `The dragon sleeps in a cave!`
                        ])
                    else if (this.directions.includes('W'))
                        new Render(x - 1, y, state.carry, 'WEST')
                    else
                        this.badDirection()
                    break
                case 'NORTH': case 'N':
                    if (this.directions.includes('N'))
                        new Render(x, y - 1, state.carry, 'NORTH')
                    else
                        this.badDirection()
                    break
                case 'EAST': case 'E':
                    if (this.directions.includes('E'))
                        new Render(x + 1, y, state.carry, 'EAST')
                    else
                        this.badDirection()
                    break
                case 'SOUTH': case 'S':
                    if (this.directions.includes('S'))
                        new Render(x, y + 1, state.carry, 'SOUTH')
                    else
                        this.badDirection()
                    break
                case 'V': case 'VOCABULARY':
                    this.displayVocabulary()
                    break
                case 'G': case 'GOSSIPS':
                    this.displayGossips()
                    break
                default:
                    this.badCommand()
            }
        }
        else if (query.split(' ').length == 2) {  //commands with parameter
            switch (query.split(' ')[0]) {
                case 'T': case 'TAKE':
                    this.takeItem(query.split(' ')[1])
                    break
                case 'D': case 'DROP':
                    this.dropItem(query.split(' ')[1])
                    break
                case 'U': case 'USE':
                    this.useItem(query.split(' ')[1])
                    break
                default:
                    this.badCommand()
            }
        }
        else
            this.badCommand()
    }

    badDirection = async () => {
        divs.write.style.display = 'none'
        divs.question.innerHTML = `You can't go that way`
        await new Promise(r => setTimeout(r, IMPORTANT_TIMEOUT));
        divs.write.style.display = 'initial'
        divs.question.innerHTML = `What now?`
        divs.write.value = ''
        divs.write.focus()
    }

    takeItem = (itemName) => {
        if (!this.items.some(el => el.name == itemName)) {
            this.displayInfo(`There isn't anything like that here`)
            return
        }
        if (state.carry != 'none') {
            this.displayInfo('You are carrying something')
            return
        }
        if (this.items.filter(a => a.name == itemName)[0].flag == '0') {
            this.displayInfo(`You can't carry this`)
            return
        }
        state.carry = this.items.filter(a => a.name == itemName)[0]
        this.items = this.items.filter(a => a.name != itemName)
        data[this.y][this.x].items = this.items
        this.displayInfo(`You are taking ${state.carry.longName}`)
    }

    dropItem = (itemName) => {
        if (state.carry == 'none') {
            this.displayInfo('You are not carrying anything')
            return
        }
        if (this.items.filter(a => a.flag == '1').length > 2) {
            this.displayInfo(`You can't story any more here`)
            return
        }
        if (state.carry.name != itemName) {
            this.displayInfo(`You are not carrying it`)
            return
        }
        this.items.push(state.carry)
        this.displayInfo(`You are about to drop ${state.carry.longName}`)
        state.carry = 'none'
    }

    useItem = async (itemName) => {
        if (state.carry.name != itemName || state.carry == 'none') {
            this.displayInfo(`You are not carrying anything like that`)
            return
        }
        if (state.carry.name == 'PRIZE') {
            this.endGame()
            return
        }
        if (!this.actions.some(action => action.requiredId == state.carry.id)) {
            this.displayInfo(`Nothing happened`)
            return
        }
        const action = this.actions.filter(el => el.requiredId == state.carry.id)[0]
        if (action.flag === '1')
            state.carry = {
                flag: action.flag,
                id: action.id,
                name: action.name,
                longName: action.longName
            }
        else if (action.flag === '0') {
            this.items.push({
                flag: action.flag,
                id: action.id,
                name: action.name,
                longName: action.longName
            })
            state.carry = 'none'
        }
        if (typeof action.text == 'string')
            this.displayInfo(action.text)
        else
            this.displayInfoWithTimeouts(action.text)
        if (action.name == 'dead dragon') {
            state.dragonDead = true
            this.img = `smok.bmp`
            await this.imgAnimation()
            document.getElementById('imganimation').style.height = '0'
            divs.img.style.backgroundImage = `url('./img/${this.img}')`
            divs.img.style.backgroundColor = this.color
            state.dragonDead = true
            data[this.y][this.x].actions.push({
                flag: "1",
                id: "34",
                longName: "a DRAGONSKIN",
                name: "DRAGONSKIN",
                requiredId: "33",
                text: "You cut a piece of dragon's skin"
            })
            this.actions.push({
                flag: "1",
                id: "34",
                longName: "a DRAGONSKIN",
                name: "DRAGONSKIN",
                requiredId: "33",
                text: "You cut a piece of dragon's skin"
            })
            return
        }
        //if sheep is ready
        if (!(this.items.filter(item => item.flag == 0).length == 6))
            return
        this.items = []
        data[this.y][this.x].items = []
        state.carry = {
            flag: '1',
            id: '37',
            name: 'SHEEP',
            longName: 'a SHEEP'
        }
        this.displayInfo('Your fake sheep is full of poison and ready to be eaten by the dragon')
    }

    displayVocabulary = async () => {
        this.vocabularyDisplayed = true
        divs.write.value = ''
        divs.write.style.display = 'none'
        divs.question.innerHTML = ''
        await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        divs.items.innerHTML = ''
        await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        divs.see.innerHTML = ''
        await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        divs.direction.innerHTML = ''
        const arr =
            [
                'NORTH or N, SOUTH or S<br>',
                'WEST or W, EAST or E<br>',
                'TAKE (object) or T (object)<br>',
                'DROP (object) or D (object)<br>',
                'USE (object) or U (object)<br>',
                'GOSSIPS or G, VOCABULARY or V<br>',
                'Press any key'
            ]
        for (const e of arr) {
            divs.direction.innerHTML += e
            await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        }
    }

    deleteVocabulary = async () => {
        this.vocabularyDisplayed = false
        const arr =
            [
                'NORTH or N, SOUTH or S<br>',
                'WEST or W, EAST or E<br>',
                'TAKE (object) or T (object)<br>',
                'DROP (object) or D (object)<br>',
                'USE (object) or U (object)<br>',
                'GOSSIPS or G, VOCABULARY or V<br>',
                'Press any key'
            ]
        for (let i = arr.length; i >= 0; i--) {
            divs.direction.innerHTML = ''
            for (let j = 0; j < i; j++)
                divs.direction.innerHTML += arr[j]
            await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        }
        this.generateText()
    }

    displayGossips = async () => {
        this.gossipsDisplayed = true
        divs.write.value = ''
        divs.write.style.display = 'none'
        divs.question.innerHTML = ''
        await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        divs.items.innerHTML = ''
        await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        divs.see.innerHTML = ''
        await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        divs.direction.innerHTML = ''
        const arr = [
            "The  woodcutter lost  his home key...<br>",
            "The butcher likes fruit... The cooper<br>",
            "is greedy... Dratewka plans to make a<br>",
            "poisoned  bait for the dragon...  The<br>",
            "tavern owner is buying food  from the<br>",
            "pickers... Making a rag from a bag...<br>",
            "Press any key"
        ]
        for (const e of arr) {
            divs.direction.innerHTML += e
            await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        }
    }

    deleteGossips = async () => {
        this.gossipsDisplayed = false
        const arr =
            [
                "The  woodcutter lost  his home key...<br>",
                "The butcher likes fruit... The cooper<br>",
                "is greedy... Dratewka plans to make a<br>",
                "poisoned  bait for the dragon...  The<br>",
                "tavern owner is buying food  from the<br>",
                "pickers... Making a rag from a bag...<br>",
                "Press any key"
            ]
        for (let i = arr.length; i >= 0; i--) {
            divs.direction.innerHTML = ''
            for (let j = 0; j < i; j++)
                divs.direction.innerHTML += arr[j]
            await new Promise(r => setTimeout(r, SHORT_TIMEOUT))
        }
        this.generateText()
    }

    badCommand = async () => {
        divs.question.innerHTML = 'Try another word or V for vocabulary'
        divs.write.value = ''
        divs.write.style.display = 'none'
        await new Promise(r => setTimeout(r, IMPORTANT_TIMEOUT))
        divs.question.innerHTML = 'What now?'
        divs.write.style.display = 'initial'
    }

    endGame = () => {
        document.getElementById('wrapper').innerHTML = ''
        let div = document.createElement('div')
        div.id = 'end'
        document.getElementById('wrapper').appendChild(div)
    }
}

document.onmousedown = (e) => {
    e.preventDefault();
}

const displayStart = () => {
    window.removeEventListener('keydown', displayStart)
    new Start()
}

window.addEventListener('keydown', displayStart)
