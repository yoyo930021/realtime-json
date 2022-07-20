# Realtime JSON

a simple socket.io application for json change notification.


## Server
```bash
yarn
cp .env.example .env
# edit .env
vim .env

# test
node index.js

# production
pm2 start index.js -i 1
```

## Client
```javascript
import io from 'socket.io-client'
import set from 'lodash.set'

socket = io('__PUBLIC_URL__')

let data = null

// Get full information
socket.emit('data')
// Get full information from server send
socket.on('data', (result) => {
  console.log(result)
  data = result
})

// Get changed data from server send
socket.on('update', (diff) => {
  // deep copy
  const newData = JSON.parse(JSON.stringify(data))

  // flat keys
  const flat = (obj, concatenator = '.') => (
    Object.keys(obj).reduce(
      (acc, key) => {
        if (typeof obj[key] !== 'object' || !obj[key]) {
          return {
            ...acc,
            [key]: obj[key],
          };
        }

        const flattenedChild = flat(obj[key], concatenator);

        return {
          ...acc,
          ...Object.keys(flattenedChild).reduce((childAcc, childKey) => ({ ...childAcc, [`${key}${concatenator}${childKey}`]: flattenedChild[childKey] }), {}),
        };
      },
      {},
    )
  )

  // set it
  const r = flat(diff)
  Object.keys(r).forEach((key) => {
    set(newData, key, r[key])
  })

  // remove array undefined
  const result = JSON.parse(JSON.stringify(newData, (_, v) => Array.isArray(v) ? v.filter(e => e) : v))
  console.log(result)
  data = result
})
```
