type State = number[][]; // Matriz 3x3
type Move = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface Node {
  state: State;
  parent: Node | null;
  move: Move | null;
  depth: number;
  cost: number; // usado pela heurística
}

// ==========================
// Funções utilitárias
// ==========================
function cloneState(state: State): State {
  return state.map(row => [...row]);
}

function statesEqual(a: State, b: State): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function findEmpty(state: State): [number, number] {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (state[i][j] === 0) return [i, j];
    }
  }
  throw new Error("Espaço vazio não encontrado");
}

function moveTile(state: State, move: Move): State | null {
  const [i, j] = findEmpty(state);
  const newState = cloneState(state);

  switch (move) {
    case "UP":
      if (i === 0) return null;
      [newState[i][j], newState[i - 1][j]] = [newState[i - 1][j], newState[i][j]];
      break;
    case "DOWN":
      if (i === 2) return null;
      [newState[i][j], newState[i + 1][j]] = [newState[i + 1][j], newState[i][j]];
      break;
    case "LEFT":
      if (j === 0) return null;
      [newState[i][j], newState[i][j - 1]] = [newState[i][j - 1], newState[i][j]];
      break;
    case "RIGHT":
      if (j === 2) return null;
      [newState[i][j], newState[i][j + 1]] = [newState[i][j + 1], newState[i][j]];
      break;
  }

  return newState;
}

function reconstructPath(node: Node): Move[] {
  const path: Move[] = [];
  let current: Node | null = node;
  while (current && current.move !== null) {
    path.unshift(current.move);
    current = current.parent;
  }
  return path;
}

function printState(state: State, title: string): void {
  console.log(`\n${title}:`);
  for (let i = 0; i < 3; i++) {
    const row = state[i].map(cell => cell === 0 ? '_' : cell.toString()).join(' ');
    console.log(`| ${row} |`);
  }
}

function applyMoves(initialState: State, moves: Move[]): State {
  let currentState = cloneState(initialState);
  for (const move of moves) {
    const newState = moveTile(currentState, move);
    if (newState) {
      currentState = newState;
    }
  }
  return currentState;
}

// ==========================
// Heurísticas
// ==========================
function manhattanDistance(state: State, goal: State): number {
  let distance = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const value = state[i][j];
      if (value !== 0) {
        for (let x = 0; x < 3; x++) {
          for (let y = 0; y < 3; y++) {
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
export function bfs(start: State, goal: State): Move[] | null {
  const root: Node = { state: start, parent: null, move: null, depth: 0, cost: 0 };
  const queue: Node[] = [root];
  const visited = new Set<string>();
  visited.add(JSON.stringify(start));

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (statesEqual(node.state, goal)) {
      return reconstructPath(node);
    }

    for (const move of ["UP", "DOWN", "LEFT", "RIGHT"] as Move[]) {
      const newState = moveTile(node.state, move);
      if (newState && !visited.has(JSON.stringify(newState))) {
        visited.add(JSON.stringify(newState));
        queue.push({ state: newState, parent: node, move, depth: node.depth + 1, cost: 0 });
      }
    }
  }
  return null;
}

// ==========================
// Busca Gulosa (Greedy Best-First)
// ==========================
export function greedy(start: State, goal: State): Move[] | null {
  const root: Node = {
    state: start,
    parent: null,
    move: null,
    depth: 0,
    cost: manhattanDistance(start, goal),
  };

  const open: Node[] = [root];
  const visited = new Set<string>();
  visited.add(JSON.stringify(start));

  while (open.length > 0) {
    // Seleciona nó com menor heurística
    open.sort((a, b) => a.cost - b.cost);
    const node = open.shift()!;

    if (statesEqual(node.state, goal)) {
      return reconstructPath(node);
    }

    for (const move of ["UP", "DOWN", "LEFT", "RIGHT"] as Move[]) {
      const newState = moveTile(node.state, move);
      if (newState && !visited.has(JSON.stringify(newState))) {
        visited.add(JSON.stringify(newState));
        open.push({
          state: newState,
          parent: node,
          move,
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
  const start: State = [
    [1, 2, 3],
    [4, 0, 6],
    [7, 5, 8],
  ];

  const goal: State = [
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
  const bfsResult = bfs(start, goal);
  console.timeEnd("BFS");
  console.log("Solução BFS:", bfsResult);
  
  if (bfsResult) {
    const finalStateBFS = applyMoves(start, bfsResult);
    printState(finalStateBFS, "RESULTADO FINAL BFS");
    console.log(`Número de movimentos: ${bfsResult.length}`);
  }

  console.log("\n" + "=".repeat(40));
  console.log("=== BUSCA GULOSA (Greedy) ===");
  console.time("Greedy");
  const greedyResult = greedy(start, goal);
  console.timeEnd("Greedy");
  console.log("Solução Greedy:", greedyResult);
  
  if (greedyResult) {
    const finalStateGreedy = applyMoves(start, greedyResult);
    printState(finalStateGreedy, "RESULTADO FINAL GREEDY");
    console.log(`Número de movimentos: ${greedyResult.length}`);
  }
}
