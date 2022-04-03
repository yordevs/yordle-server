import seedrandom from "seedrandom"

interface Answer {
    word: string,
    description: string
}

const getAnswer = function (list: Array<Answer>): Answer {
    const base: Date = new Date('4/3/2022');
    const date: Date = new Date();
    const diffTime: number = Math.abs(date.getTime() - base.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const answerPos = diffDays % list.length
    const dateSeed = diffDays - answerPos
    const seedDate = new Date('4/3/2022')
    seedDate.setTime(0)
    seedDate.setDate(base.getDate() + dateSeed)
    
    const seed = `${seedDate.getTime()}`
    
    let generator = seedrandom(seed)
    for (let i = 0; i < list.length; i++) {
        let newPos = Math.floor(list.length * generator())
        let tmp = list[newPos]
        list[newPos] = list[i]
        list[i] = tmp
    }
    return list[answerPos]
}

export default getAnswer