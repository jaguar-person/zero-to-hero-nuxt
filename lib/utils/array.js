export const uniqueByValue = (array, key) => {
  let flags = []
  let unique = []
  let l = array.length
  for (let i = 0; i < l; i++) {
    if (flags[array[i][key]]) continue
    flags[array[i][key]] = true
    unique.push(array[i])
  }
  return unique
}
// https://stackoverflow.com/questions/38613654/javascript-find-unique-objects-in-array-based-on-multiple-properties
export const uniqueByValues = (arr, keyProps) => {
  const kvArray = arr.map(entry => {
    const key = keyProps.map(k => entry[k]).join('|');
    return [key, entry];
  });
  const map = new Map(kvArray);
  return Array.from(map.values());
}
export const uniqueSort = (items, uniqueKey, sortKey, order, locale) => {
  return uniqueByValue(items, uniqueKey).sort((x, y) => {
    if (order === 'ascending') {
      return x[sortKey] ? x[sortKey].localeCompare(y[sortKey], locale, { numeric: true }) : 0
    } else {
      return y[sortKey] ? y[sortKey].localeCompare(x[sortKey], locale, { numeric: true }) : 0
    }
  })

}
export const flatten = (object) => {
  return Object.keys(object).reduce((r, k) => { return r.concat(object[k]) }, [])
}
// https://www.consolelog.io/group-by-in-javascript/
export const groupArrayBy = (array, prop) => {
  return array.reduce(function (groups, item) {
    const val = item[prop]
    groups[val] = groups[val] || []
    groups[val].push(item)
    return groups
  }, {})
}
export const unique = (a) => {
  return a.filter((item, i, ar) => ar.indexOf(item) === i);
}
/*
 * If we have an array ['ad', 'adi', 'adim'], this will filter out 'adi' and 'adim' and give you ['ad']
 */
export const mutuallyExclusive = (a) => {
  let mutuallyExclusive = []
  for (let igenek of a) {
    let pass = true
    for (let igen of a) {
      if (igenek !== igen && igenek.includes(igen)) pass = false
    }
    if (pass) mutuallyExclusive.push(igenek)
  }
  return mutuallyExclusive
}
// https://css-tricks.com/snippets/javascript/shuffle-array/
// THIS MUTATES THE ARRAY!
export const shuffle = (o) => {
  for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}
export const arrayChunk = (array, chunk = 10) => {
  var i, j, temporary;
  var chunks = []
  for (i = 0, j = array.length; i < j; i += chunk) {
    temporary = array.slice(i, i + chunk);
    chunks.push(temporary)
  }
  return chunks
}