import moment from "moment/moment";
import {useState} from "react";

export function useDatePicker() {
  const [calendar, setCalendar] = useState(buildCalendar(moment().format('YYYY-MM-DD')))
  type selectedType = { firstDate: string; secondDate: string }
  const selectDates: selectedType = {firstDate: '', secondDate: ''}
  const [selected, setSelected] = useState(selectDates)
  console.log(calendar)
  const currYear = calendar.year
  const currMonth = calendar.month

  function buildCalendar(currday: string) {
    const currMoment = moment(currday, 'YYYY-MM-DD')
    const year = currMoment.year()
    const month = currMoment.month() + 1 // 月份從 0 開始，所以 +1
    const daysInMonth = currMoment.daysInMonth()

    const firstDay = currMoment.clone().startOf('month').day() // 取得當月第一天是星期幾
    const lastDay = currMoment.clone().endOf('month').day() // 取得當月最後一天是星期幾

    // 當月主要日期
    let days = Array.from({length: daysInMonth}, (_, i) => {
      const date = currMoment.clone().date(i + 1)
      return {
        date: date.format('YYYY-MM-DD'),
        day: (i + 1).toString(),
        state: date.isSame(moment(), 'day') ? 'today' : 'default',
        selected: false,
      }
    })

    // 補前一個月的日期
    if (firstDay !== 0) {
      const prevMonthMoment = currMoment.clone().subtract(1, 'month')
      const prevMonthDays = prevMonthMoment.daysInMonth()
      const prevMonthDates = Array.from({length: firstDay}, (_, i) => {
        const date = prevMonthMoment.clone().date(prevMonthDays - firstDay + i + 1)
        return {
          date: date.format('YYYY-MM-DD'),
          day: date.date().toString(),
          state: 'other',
          selected: false,
        }
      })
      days = [...prevMonthDates, ...days]
    }

    // 補後一個月的日期
    if (lastDay !== 6) {
      const nextMonthMoment = currMoment.clone().add(1, 'month')
      const nextMonthDates = Array.from({length: 6 - lastDay}, (_, i) => {
        const date = nextMonthMoment.clone().date(i + 1)
        return {
          date: date.format('YYYY-MM-DD'),
          day: date.date().toString(),
          state: 'other',
          selected: false,
        }
      })
      days = [...days, ...nextMonthDates]
    }
    return {days, year, month}
  }

  function changeMonth(direction: 'prev' | 'next') {
    let newYear = currYear
    let newMonth = currMonth + (direction === 'prev' ? -1 : 1)

    if (newMonth === 0) {
      newYear -= 1
      newMonth = 12
    } else if (newMonth === 13) {
      newYear += 1
      newMonth = 1
    }

    const findDate = `${newYear}-${String(newMonth).padStart(2, '0')}-01`
    setCalendar(buildCalendar(findDate))
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    const clickedValue = event.currentTarget.dataset.value
    if (!clickedValue) return

    const {firstDate, secondDate} = selected
    // 如果 firstDate 還沒選擇，或者 secondDate 已經有值，或者 clickedValue < firstDate，則重新選擇 firstDate
    if (!firstDate || secondDate || clickedValue < firstDate) {
      setSelected({firstDate: clickedValue, secondDate: ''})
      return
    }
    // 如果 secondDate 還沒選，並且 clickedValue >= firstDate，則當成 secondDate
    if (!secondDate && clickedValue >= firstDate) {
      setSelected({...selected, secondDate: clickedValue})
    }
  }

  return {selected, calendar, handleClick, changeMonth};
}