import locationData from './data/locationData.js'
import itemData from './data/itemData.js'

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

class Location {
    title
    img
    color
    directions = ['W', 'N', 'E', 'S']
    see = 'none'
    constructor(x, y) {
        let loc = locationData[y][x]
        this.title = loc.title
        this.img = loc.img
        this.color = loc.color
        this.directions = loc.directions
    }
}

class Render extends Location {
    items

    vocabularyDispyated = false
    gossipsDisplayed = false

    constructor(x, y, items, direction) {
        super(x, y)
        this.items = items
        this.generateHTML(direction)
        window.onkeydown = e => this.handleKeydown(e, x, y)
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
        if (this.see == 'none')
            str += 'nothing'
        return str
    }

    getItems = () => {
        let str = 'You are carrying '
        if (this.items == 'none')
            str += 'nothing'
        return str
    }

    handleKeydown = (e, x, y) => {
        if (this.vocabularyDisplayed) {
            this.deleteVocabulary()
            return
        }
        else if (this.gossipsDisplayed) {
            this.deleteGossips()
            return
        }
        if (e.key != 'Enter') return
        const query = (divs.write.value).toUpperCase()
        if (query.split(' ').length == 1) {  //commands without parameter
            switch (query) {
                case 'W': case 'WEST':
                    if (this.directions.includes('W'))
                        new Render(x - 1, y, this.items, 'WEST')
                    else
                        this.badDirection()
                    break
                case 'NORTH': case 'N':
                    if (this.directions.includes('N'))
                        new Render(x, y - 1, this.items, 'NORTH')
                    else
                        this.badDirection()
                    break
                case 'EAST': case 'E':
                    if (this.directions.includes('E'))
                        new Render(x + 1, y, this.items, 'EAST')
                    else
                        this.badDirection()
                    break
                case 'SOUTH': case 'S':
                    if (this.directions.includes('S'))
                        new Render(x, y + 1, this.items, 'SOUTH')
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

    takeItem = () => {

    }

    dropItem = () => {

    }

    useItem = () => {

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

let str = `10, 56, 11, You opened a tool shed and took an axe
11, 67, 12, You cut sticks for sheeplegs
12, 43, 13(L), You prepared legs for your fake sheep, OK
14, 34, 15, The tavern owner paid you money
15, 37, 16, The cooper sold you a new barrel
16, 43, 17(L), You made a nice sheeptrunk, OK
18, 36, 19, The butcher gave you wool
19, 43, 20(L), You prepared skin for your fake sheep, OK
21, 57, 22, You used your tools to make a rag
22, 43, 23(L), You made a fake sheephead, OK
24, 11, 25, You are digging... (timeout) and digging... (timeout) That's enough sulphur for you
25, 43, 26(L), You prepared a solid poison, OK
27, 21, 28, You got a bucket full of tar
28, 43, 29(L), You prepared a liquid poison, OK
gdy zebrane wszystkie przedmioty (6*OK), 43, 37, Your fake sheep is full of poison and ready to be eaten by the dragon
37, 43, 30(L), The dragon noticed your gift... (timeout) The dragon ate your sheep and died! - podmiana grafiki na lokacji (martwy smok)!
33, 43 + zabity smok, 34, You cut a piece of dragon's skin
34, 57, 35, You used your tools to make shoes
35, 41, 36, The King is impressed by your shoes`

const getjson5 = (str) => {
    let arr = []
    let rows = str.split('\n')
    // for (const row of rows){
    //     row.a
    // }

    return arr
}


console.log(JSON.stringify(getjson5(str)))