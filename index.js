import data from './data/data.js'
console.log(data)

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
    constructor(x, y, items) {
        super(x, y)
        console.log(x)
        this.items = items
        document.getElementById('title').innerHTML = this.title
        document.getElementById('img').style.backgroundImage = `url('./img/${this.img}')`
        document.getElementById('img').style.backgroundColor = this.color
        document.getElementById('direction').innerHTML = this.getDirection()
        document.getElementById('see').innerHTML = this.getSee()
        document.getElementById('items').innerHTML = this.getItems()
        document.getElementById('write').value = ''
        window.onkeydown = e => this.handleKeydown(e, x, y, items)
    }
    getDirection() {
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
    getSee() {
        let str = 'You see '
        if (this.see == 'none')
            str += 'nothing'
        return str
    }
    getItems() {
        let str = 'You are carrying '
        if (this.items == 'none')
            str += 'nothing'
        return str
    }
    handleKeydown(e, x, y, items) {
        if (e.key != 'Enter') return
        const move = (document.getElementById('write').value).toUpperCase()
        switch (move) {
            case 'WEST', 'W':
                if (this.directions.includes('W'))
                    new Render(x - 1, y, items)
                break
            case 'NORTH', 'N':
                if (this.directions.includes('N'))
                    new Render(x, y - 1, items)
                break
            case 'EAST', 'E':
                if (this.directions.includes('E'))
                    new Render(x + 1, y, items)
                break
            case 'SOUTH', 'S':
                if (this.directions.includes('S'))
                    new Render(x, y + 1, items)
        }
    }
}

document.onmousedown = (e) => {
    e.preventDefault();
}

window.addEventListener('DOMContentLoaded', async () => {
    new Render(6, 5, 'none')
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
