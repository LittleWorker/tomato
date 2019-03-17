export function isJson(jsonStr) {
  if (typeof jsonStr === 'string') {
    try {
      JSON.parse(jsonStr)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }
  console.log('param is not a string')
  return false
}
