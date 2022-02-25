import data from './data/data.js'

console.log(data)

const SHORT_TIMEOUT = 0
const LONG_TIMEOUT = 0

const divs = {
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

let state = {
    carry: 'none',
    dragonDead: false
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
                return val === val.toLowerCase() ? val.toUpperCase() : val.toLowerCase();
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
        await new Promise(r => setTimeout(r, 1000))
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
            await new Promise(r => setTimeout(r, 1000))
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
                    if (this.title == "You are inside a dragon's cave")
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
        await new Promise(r => setTimeout(r, LONG_TIMEOUT));
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
        state.carry = data[this.y][this.x].items.filter(a => a.name == itemName)[0]
        this.items = data[this.y][this.x].items.filter(a => a.name != itemName)
        data[this.y][this.x].items = data[this.y][this.x].items.filter(a => a.name != itemName)
        this.displayInfo(`You are taking ${state.carry.longName}`)
    }

    dropItem = (itemName) => {
        if (state.carry == 'none') {
            this.displayInfo('You are not carrying anything')
            return
        }
        if (this.items.length > 2) {
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
        await new Promise(r => setTimeout(r, LONG_TIMEOUT))
        divs.question.innerHTML = 'What now?'
        divs.write.style.display = 'initial'
    }

    endGame = () => {
        alert("END")
    }
}

document.onmousedown = (e) => {
    e.preventDefault();
}

window.addEventListener('DOMContentLoaded', async () => {
    new Render(6, 3, 'none')
})


// const getjson = (str) => {
//     let rows = str.split('WIERSZ').filter(a => a !== '\n').map(a => a.substring(4, a.length))
//     let arr = []
//     for (const e of rows) {
//         let locations = e.split('\n')
//         locations = locations.filter(a => a != '')
//         let row = []
//         for (const f of locations) {
//             let loc = f.split(/, /g)
//             row.push({ title: loc[0], img: loc[1], color: loc[2] })
//         }
//         arr.push(row)
//     }
//     return JSON.stringify(arr)
// }

// const getjson2 = (str) => {
//     let items = str.split('\n')
//     let arr = []
//     for (const e of items) {
//         const id = e.split(' - ')[0]
//         const longName = e.split(' - ')[1].split(',')[0]
//         const flag = e.split(',')[1]
//         const name = e.split(',')[2]
//         arr.push({ id, longName, flag, name })
//     }
//     return JSON.stringify(arr)
// }

// const getjson3 = (str) => {
//     let rows = str.split('\n')
//     let arr = []
//     for (const e of rows) {
//         arr.push({
//             loc: e.split(' - ')[0],
//             id: e.split(' - ')[1]
//         })
//     }
//     return arr
// }

// console.log(JSON.stringify(getjson3(`13 - 31
// 15 - 27
// 17 - 14
// 23 - 10
// 27 - 18
// 32 - 32
// 44 - 21
// 55 - 33
// 64 - 24`)))

// let st = '[{"loc":"13","id":"31"},{"loc":"15","id":"27"},{"loc":"17","id":"14"},{"loc":"23","id":"10"},{"loc":"27","id":"18"},{"loc":"32","id":"32"},{"loc":"44","id":"21"},{"loc":"55","id":"33"},{"loc":"64","id":"24"}]'


// const getjson4 = (locations, items, itemLocations) => {
//     let arr = []
//     itemLocations = JSON.parse(itemLocations)
//     for (let i = 0; i < locations.length; i++) {
//         let row = []
//         for (const [j, location] of locations[i].entries()) {
//             let hasItem = false
//             const itemLocation = itemLocations.filter(el => el.loc == `${i + 1}${j + 1}`)[0]
//             if (itemLocation != undefined) {
//                 const item = items.filter(el => el.id == itemLocation.id)[0]
//                 console.log(item)
//                 row.push({
//                     title: location.title,
//                     img: location.img,
//                     color: location.color,
//                     directions: location.directions,
//                     item: {
//                         id: item.id,
//                         longName: item.longName,
//                         flag: item.flag,
//                         name: item.name
//                     }
//                 })
//                 hasItem = true
//             }
//             let obj
//             if (!hasItem) {
//                 obj = {
//                     title: location.title,
//                     img: location.img,
//                     color: location.color,
//                     directions: location.directions
//                 }
//                 if (obj.title == undefined)
//                     for (const key in obj) {
//                         obj[key] = 'none'
//                     }
//                 row.push(obj)
//             }
//         }
//         arr.push(row)
//     }
//     return arr
// }


// console.log(JSON.stringify(getjson4(locationData, itemData, st)))

// let str = `10, 56, 11, You opened a tool shed and took an axe
// 11, 67, 12, You cut sticks for sheeplegs
// 12, 43, 13(L), You prepared legs for your fake sheep, OK
// 14, 34, 15, The tavern owner paid you money
// 15, 37, 16, The cooper sold you a new barrel
// 16, 43, 17(L), You made a nice sheeptrunk, OK
// 18, 36, 19, The butcher gave you wool
// 19, 43, 20(L), You prepared skin for your fake sheep, OK
// 21, 57, 22, You used your tools to make a rag
// 22, 43, 23(L), You made a fake sheephead, OK
// 24, 11, 25, You are digging... (timeout) and digging... (timeout) That's enough sulphur for you
// 25, 43, 26(L), You prepared a solid poison, OK
// 27, 21, 28, You got a bucket full of tar
// 28, 43, 29(L), You prepared a liquid poison, OK
// 37, 43, 30(L), The dragon noticed your gift... (timeout) The dragon ate your sheep and died! - podmiana grafiki na lokacji (martwy smok)!
// 33, 43, 34, You cut a piece of dragon's skin
// 34, 57, 35, You used your tools to make shoes
// 35, 41, 36, The King is impressed by your shoes`



// const getjson5 = (str, itemData) => {
//     let arr = []
//     let rows = str.split('\n')
//     for (const row of rows) {
//         let cells = row.split(', ')
//         console.log(itemData[0].id)
//         console.log(cells[2])
//         cells[2] = cells[2].substring(0, 2)
//         const flag = itemData.filter(a => a.id == cells[2])[0].flag
//         const name = itemData.filter(a => a.id == cells[2])[0].name
//         const longName = itemData.filter(a => a.id == cells[2])[0].longName
//         arr.push({
//             requiredId: cells[0],
//             location: cells[1],
//             id: cells[2],
//             text: cells[3],
//             flag: flag,
//             name: name,
//             longName: longName
//         })
//     }
//     return arr
// }

// let str = `[{"requiredId":"10","location":"56","id":"11","text":"You opened a tool shed and took an axe","flag":"1","name":"AXE","longName":"an AXE"},{"requiredId":"11","location":"67","id":"12","text":"You cut sticks for sheeplegs","flag":"1","name":"STICKS","longName":"STICKS"},{"requiredId":"12","location":"43","id":"13","text":"You prepared legs for your fake sheep","flag":"0","name":"sheeplegs","longName":"sheeplegs"},{"requiredId":"14","location":"34","id":"15","text":"The tavern owner paid you money","flag":"1","name":"MONEY","longName":"MONEY"},{"requiredId":"15","location":"37","id":"16","text":"The cooper sold you a new barrel","flag":"1","name":"BARREL","longName":"a BARREL"},{"requiredId":"16","location":"43","id":"17","text":"You made a nice sheeptrunk","flag":"0","name":"sheeptrunk","longName":"a sheeptrunk"},{"requiredId":"18","location":"36","id":"19","text":"The butcher gave you wool","flag":"1","name":"WOOL","longName":"WOOL"},{"requiredId":"19","location":"43","id":"20","text":"You prepared skin for your fake sheep","flag":"0","name":"sheepskin","longName":"a sheepskin"},{"requiredId":"21","location":"57","id":"22","text":"You used your tools to make a rag","flag":"1","name":"RAG","longName":"a RAG"},{"requiredId":"22","location":"43","id":"23","text":"You made a fake sheephead","flag":"0","name":"sheephead","longName":"a sheephead"},{"requiredId":"24","location":"11","id":"25","text":"You are digging... (timeout) and digging... (timeout) That's enough sulphur for you","flag":"1","name":"SULPHUR","longName":"SULPHUR"},{"requiredId":"25","location":"43","id":"26","text":"You prepared a solid poison","flag":"0","name":"solid poison","longName":"a solid poison"},{"requiredId":"27","location":"21","id":"28","text":"You got a bucket full of tar","flag":"1","name":"TAR","longName":"TAR"},{"requiredId":"28","location":"43","id":"29","text":"You prepared a liquid poison","flag":"0","name":"liquid poison","longName":"a liquid poison"},{"requiredId":"37","location":"43","id":"30","text":"The dragon noticed your gift... (timeout) The dragon ate your sheep and died! - podmiana grafiki na lokacji (martwy smok)!","flag":"0","name":"dead dragon","longName":"a dead dragon"},{"requiredId":"33","location":"43","id":"34","text":"You cut a piece of dragon's skin","flag":"1","name":"DRAGONSKIN","longName":"a DRAGONSKIN"},{"requiredId":"34","location":"57","id":"35","text":"You used your tools to make shoes","flag":"1","name":"SHOES","longName":"a dragonskin SHOES"},{"requiredId":"35","location":"41","id":"36","text":"The King is impressed by your shoes","flag":"1","name":"PRIZE","longName":"a PRIZE"}]`

// let data = JSON.parse(JSON.stringify(locationData))

// const getjson6 = (str) => {
//     let actionArr = JSON.parse(str)
//     for (const action of actionArr) {
//         const y = action.location[0] - 1
//         const x = action.location[1] - 1
//         console.log({ y, x })
//         data[y][x] = {
//             ...data[y][x],
//             action: { ...action }
//         }
//     }
// }
// // console.log(JSON.stringify(getjson6(str, locationData)))
// getjson6(str)
// console.log(JSON.stringify(data))

// const getjson7 = () => {
//     for (let i = 0; i < data.length; i++) {
//         for (let j = 0; j < data[i].length; j++) {
//             if (!data[i][j].action)
//                 data[i][j].action = 'none'
//             if (!data[i][j].item)
//                 data[i][j].item = 'none'
//         }
//     }
// }

// getjson7()
// console.log(JSON.stringify(data))
// function getjson8() {
//     for (let i = 0; i < data.length; i++) {
//         for (let j = 0; j < data[i].length; j++) {
//             if (data[i][j].action?.location)
//                 data[i][j].action = {
//                     flag: data[i][j].action.flag,
//                     id: data[i][j].action.id,
//                     longName: data[i][j].action.longName,
//                     name: data[i][j].action.name,
//                     requiredId: data[i][j].action.requiredId,
//                     text: data[i][j].action.text,
//                 }
//         }
//     }
// }

// getjson8()
// console.log(JSON.stringify(data))

// function getjson8() {
//     for (let i = 0; i < data.length; i++) {
//         for (let j = 0; j < data[i].length; j++) {
//             if (data[i][j].action?.id)
//                 data[i][j].action = [{
//                     flag: data[i][j].action.flag,
//                     id: data[i][j].action.id,
//                     longName: data[i][j].action.longName,
//                     name: data[i][j].action.name,
//                     requiredId: data[i][j].action.requiredId,
//                     text: data[i][j].action.text,
//                 }]
//             if (data[i][j].item?.id)
//                 data[i][j].item = [{
//                     flag: data[i][j].item.flag,
//                     id: data[i][j].item.id,
//                     longName: data[i][j].item.longName,
//                     name: data[i][j].item.name
//                 }]
//         }
//     }
// }

// getjson8()
// console.log(data)
// console.log(JSON.stringify(data))