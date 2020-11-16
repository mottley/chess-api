import { Chess } from 'chess.js';


// const chess = new Chess('rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2')
// const chess = new Chess('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2')
// console.log(chess.ascii())
// console.log(chess.moves())

// chess.move('f3') // white
// chess.move('e5') // black
// chess.move('g4') // white

// console.log(chess.moves())
// console.log(chess.move('Qh4')) // black

// console.log(chess.ascii())

// console.log('game over: ', chess.game_over())
// console.log('check', chess.in_check())
// console.log('checkmate: ', chess.in_checkmate())

const chess = new Chess();
chess.move({ from: 'f2', to: 'f3' })
chess.move({ from: 'e7', to: 'e5' })
chess.move({ from: 'g2', to: 'g4' })
chess.move({ from: 'd8', to: 'h4' })

console.log(chess.ascii())
console.log(chess.history())