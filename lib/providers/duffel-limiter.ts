const MAX_PARALLEL = 3

let active = 0
const queue: (() => void)[] = []

function pump() {
  while (active < MAX_PARALLEL && queue.length > 0) {
    const next = queue.shift()
    if (next) next()
  }
}

export function withDuffelLimit<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      active += 1
      fn()
        .then(resolve, reject)
        .finally(() => {
          active -= 1
          pump()
        })
    }
    if (active < MAX_PARALLEL) run()
    else queue.push(run)
  })
}
