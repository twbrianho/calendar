import {useState, useRef} from 'react'
import moment from 'moment'
import clsx from 'clsx'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import {useDatePicker} from "../hooks/useDatePicker.ts";

const currday = moment().format('YYYY-MM-DD')

// const currday = moment('2024-08-17', 'YYYY-MM-DD').format('YYYY-MM-DD')

interface CalendarHeadProps {
  dates: { year: number; month: number }
  changeMonth?: (direction: 'prev' | 'next') => void
}

export function CalendarHead(props: CalendarHeadProps) {
  const {dates, changeMonth} = props;
  return (
    <div className="header">
      <button onClick={() => changeMonth?.('prev')}>
        <ChevronLeft className="icon"/>
      </button>
      <p>
        {dates.year} 年 {dates.month} 月
      </p>
      <button onClick={() => changeMonth?.('next')}>
        <ChevronRight className="icon"/>
      </button>
    </div>
  )
}

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

export function CrossMonthCalendar() {
  const [calendar, setCalendar] = useState(buildCalendar(currday))
  type selectedType = { firstDate: string; secondDate: string }
  const selectDates: selectedType = {firstDate: '', secondDate: ''}
  const [selected, setSelected] = useState(selectDates)
  console.log(calendar)
  const currYear = calendar.year
  const currMonth = calendar.month

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
    // 如果 firstDate 還沒選擇，或者 secondDate 已經有值，則重新選擇 firstDate
    if (!firstDate || secondDate) {
      setSelected({firstDate: clickedValue, secondDate: ''})
      return
    }
    // 如果 clickedValue < firstDate，則當成新的 firstDate
    if (clickedValue < firstDate) {
      setSelected({firstDate: clickedValue, secondDate: ''})
      return
    }
    // 如果 secondDate 還沒選，並且 clickedValue >= firstDate，則當成 secondDate
    if (!secondDate && clickedValue >= firstDate) {
      setSelected({...selected, secondDate: clickedValue})
    }
  }

  return (
    <div id="crossMonth" className="calendar">
      <p className="selectedText">
        Selected Dates: {selected.firstDate} - {selected.secondDate}
      </p>
      <CalendarHead dates={{year: calendar.year, month: calendar.month}} changeMonth={changeMonth}/>
      <hr/>
      <div className="dates">
        {calendar.days.map((c, i) => (
          <button
            key={i}
            data-value={c.date}
            onClick={handleClick}
            className={clsx('default', {today: c.state == 'today'}, {active: c.seleted == true})}
          >
            {c.day}
          </button>
        ))}
      </div>
    </div>
  )
}

export function CurrentMonthCalendar() {
  const [calendar, setCalendar] = useState(buildCalendar(currday))

  return (
    <div id="currentMonth" className="calendar">
      <CalendarHead dates={{year: calendar.year, month: calendar.month}}/>
      <hr/>
      <div className="dates">
        {calendar.days.map((c, i) => (
          <button
            key={i}
            className={clsx(
              'default',
              {today: c.state === 'today'},
              {active: c.selected},
              {disabled: c.state === 'other'}
            )}
          >
            {c.day}
          </button>
        ))}
      </div>
    </div>
  )
}

interface DatePickerProps {
  restrictMonth?: boolean;
}

export function DatePicker(props: DatePickerProps) {
  const {restrictMonth} = props;

  const {selected, calendar, handleClick, changeMonth} = useDatePicker();

  return (
    <div id="crossMonth" className="calendar">
      <p className="selectedText">
        Selected Dates: {selected.firstDate} - {selected.secondDate}
      </p>
      <CalendarHead dates={{year: calendar.year, month: calendar.month}}
                    changeMonth={restrictMonth ? undefined : changeMonth}/>
      <hr/>
      <div className="dates">
        {calendar.days.map((c, i) => {
          const isHighlighted = (selected.firstDate && !selected.secondDate && c.date === selected.firstDate) || (selected.firstDate && selected.secondDate && c.date >= selected.firstDate && c.date <= selected.secondDate)
          return (
            <button
              key={i}
              data-value={c.date}
              onClick={handleClick}
              className={clsx('default', {today: c.state == 'today'}, {active: isHighlighted})}
            >
              {c.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
