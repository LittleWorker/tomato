function sec2MinSec(sec) {
  if (sec <= 0) {
    return [0, 0]
  }

  let outMin = Math.floor(sec / 60)
  let outSec = sec % 60
  return [outMin, outSec]
}

function atLeastTwoDigit(data) {
  if (data < 10) {
    data = '0' + data
  } else {
    data = '' + data
  }
  return data
}

function getTodayDate() {
  let today = new Date()
  let year = today.getFullYear()
  let month = today.getMonth()
  let day = today.getDate()

  month = atLeastTwoDigit(month)
  day = atLeastTwoDigit(day)

  return `${year}-${month}-${day}`
}

export { sec2MinSec, atLeastTwoDigit, getTodayDate }
