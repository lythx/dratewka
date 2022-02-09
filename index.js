import data from './data/data.js'

const Els = {
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
        let loc = data[y][x]
        this.title = loc.title
        this.img = loc.img
        this.color = loc.color
        this.directions = loc.directions
    }
}

class Render extends Location {
    items

    constructor(x, y, items, direction) {
        super(x, y)
        this.items = items
        this.generateHTML(direction)
        window.onkeydown = e => this.handleKeydown(e, x, y)
    }

    generateHTML = async (direction) => {
        Els.write.value = ''
        Els.question.innerHTML = `You are going ${direction}`
        if (Els.title.innerHTML != '')
            await this.imgAnimation()
        document.getElementById('imganimation').style.height = '0'
        Els.img.style.backgroundImage = `url('./img/${this.img}')`
        Els.img.style.backgroundColor = this.color
        Els.title.innerHTML = this.title
        await new Promise(r => setTimeout(r, 100))
        this.updateCompass()
        await new Promise(r => setTimeout(r, 100))
        Els.direction.innerHTML = this.getDirection()
        await new Promise(r => setTimeout(r, 100))
        Els.see.innerHTML = this.getSee()
        await new Promise(r => setTimeout(r, 100))
        Els.items.innerHTML = this.getItems()
        await new Promise(r => setTimeout(r, 100))
        Els.question.innerHTML = 'What now?'
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
        return await new Promise(r => setTimeout(r, 1000));
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
        if (e.key != 'Enter') return
        const query = (Els.write.value).toUpperCase()
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
        Els.write.style.display = 'none'
        Els.question.innerHTML = `You can't go that way`
        await new Promise(r => setTimeout(r, 1000));
        Els.write.style.display = 'initial'
        Els.question.innerHTML = `What now?`
        Els.write.value = ''
        Els.write.focus()
    }

    takeItem = () => {

    }

    dropItem = () => {

    }

    useItem = () => {

    }

    displayVocabulary = async () => {
        Els.write.style.display = 'none'
        Els.question.innerHTML = ''
        await new Promise(r => setTimeout(r, 100))
        Els.items.innerHTML = ''
        Els.see.innerHTML = ''
        Els.direction.innerHTML = ''
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
            Els.direction.innerHTML += e
            await new Promise(r => setTimeout(r, 50))

        }
    }

    badCommand = () => {
        console.log('bad')
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
