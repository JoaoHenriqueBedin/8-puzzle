"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bfs = bfs;
exports.greedy = greedy;
// ==========================
// Funções utilitárias
// ==========================
function cloneState(state) {
    return state.map(function (row) { return __spreadArray([], row, true); });
}
function statesEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
function findEmpty(state) {
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (state[i][j] === 0)
                return [i, j];
        }
    }
    throw new Error("Espaço vazio não encontrado");
}
function moveTile(state, move) {
    var _a, _b, _c, _d;
    var _e = findEmpty(state), i = _e[0], j = _e[1];
    var newState = cloneState(state);
    switch (move) {
        case "UP":
            if (i === 0)
                return null;
            _a = [newState[i - 1][j], newState[i][j]], newState[i][j] = _a[0], newState[i - 1][j] = _a[1];
            break;
        case "DOWN":
            if (i === 2)
                return null;
            _b = [newState[i + 1][j], newState[i][j]], newState[i][j] = _b[0], newState[i + 1][j] = _b[1];
            break;
        case "LEFT":
            if (j === 0)
                return null;
            _c = [newState[i][j - 1], newState[i][j]], newState[i][j] = _c[0], newState[i][j - 1] = _c[1];
            break;
        case "RIGHT":
            if (j === 2)
                return null;
            _d = [newState[i][j + 1], newState[i][j]], newState[i][j] = _d[0], newState[i][j + 1] = _d[1];
            break;
    }
    return newState;
}
function reconstructPath(node) {
    var path = [];
    var current = node;
    while (current && current.move !== null) {
        path.unshift(current.move);
        current = current.parent;
    }
    return path;
}
function printState(state, title) {
    console.log("\n".concat(title, ":"));
    for (var i = 0; i < 3; i++) {
        var row = state[i].map(function (cell) { return cell === 0 ? '_' : cell.toString(); }).join(' ');
        console.log("| ".concat(row, " |"));
    }
}
function applyMoves(initialState, moves) {
    var currentState = cloneState(initialState);
    for (var _i = 0, moves_1 = moves; _i < moves_1.length; _i++) {
        var move = moves_1[_i];
        var newState = moveTile(currentState, move);
        if (newState) {
            currentState = newState;
        }
    }
    return currentState;
}
// ==========================
// Heurísticas
// ==========================
function manhattanDistance(state, goal) {
    var distance = 0;
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var value = state[i][j];
            if (value !== 0) {
                for (var x = 0; x < 3; x++) {
                    for (var y = 0; y < 3; y++) {
                        if (goal[x][y] === value) {
                            distance += Math.abs(i - x) + Math.abs(j - y);
                        }
                    }
                }
            }
        }
    }
    return distance;
}
// ==========================
// Busca em Largura (BFS)
// ==========================
function bfs(start, goal) {
    var root = { state: start, parent: null, move: null, depth: 0, cost: 0 };
    var queue = [root];
    var visited = new Set();
    visited.add(JSON.stringify(start));
    while (queue.length > 0) {
        var node = queue.shift();
        if (statesEqual(node.state, goal)) {
            return reconstructPath(node);
        }
        for (var _i = 0, _a = ["UP", "DOWN", "LEFT", "RIGHT"]; _i < _a.length; _i++) {
            var move = _a[_i];
            var newState = moveTile(node.state, move);
            if (newState && !visited.has(JSON.stringify(newState))) {
                visited.add(JSON.stringify(newState));
                queue.push({ state: newState, parent: node, move: move, depth: node.depth + 1, cost: 0 });
            }
        }
    }
    return null;
}
// ==========================
// Busca Gulosa (Greedy Best-First)
// ==========================
function greedy(start, goal) {
    var root = {
        state: start,
        parent: null,
        move: null,
        depth: 0,
        cost: manhattanDistance(start, goal),
    };
    var open = [root];
    var visited = new Set();
    visited.add(JSON.stringify(start));
    while (open.length > 0) {
        // Seleciona nó com menor heurística
        open.sort(function (a, b) { return a.cost - b.cost; });
        var node = open.shift();
        if (statesEqual(node.state, goal)) {
            return reconstructPath(node);
        }
        for (var _i = 0, _a = ["UP", "DOWN", "LEFT", "RIGHT"]; _i < _a.length; _i++) {
            var move = _a[_i];
            var newState = moveTile(node.state, move);
            if (newState && !visited.has(JSON.stringify(newState))) {
                visited.add(JSON.stringify(newState));
                open.push({
                    state: newState,
                    parent: node,
                    move: move,
                    depth: node.depth + 1,
                    cost: manhattanDistance(newState, goal),
                });
            }
        }
    }
    return null;
}
// ==========================
// Teste rápido
// ==========================
if (require.main === module) {
    var start = [
        [1, 2, 3],
        [4, 0, 6],
        [7, 5, 8],
    ];
    var goal = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0],
    ];
    // Mostra estado inicial e objetivo
    printState(start, "ESTADO INICIAL");
    printState(goal, "ESTADO OBJETIVO");
    console.log("\n" + "=".repeat(40));
    console.log("=== BUSCA EM LARGURA (BFS) ===");
    console.time("BFS");
    var bfsResult = bfs(start, goal);
    console.timeEnd("BFS");
    console.log("Solução BFS:", bfsResult);
    if (bfsResult) {
        var finalStateBFS = applyMoves(start, bfsResult);
        printState(finalStateBFS, "RESULTADO FINAL BFS");
        console.log("N\u00FAmero de movimentos: ".concat(bfsResult.length));
    }
    console.log("\n" + "=".repeat(40));
    console.log("=== BUSCA GULOSA (Greedy) ===");
    console.time("Greedy");
    var greedyResult = greedy(start, goal);
    console.timeEnd("Greedy");
    console.log("Solução Greedy:", greedyResult);
    if (greedyResult) {
        var finalStateGreedy = applyMoves(start, greedyResult);
        printState(finalStateGreedy, "RESULTADO FINAL GREEDY");
        console.log("N\u00FAmero de movimentos: ".concat(greedyResult.length));
    }
}
