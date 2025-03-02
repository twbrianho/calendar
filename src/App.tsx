import './App.css'
import './assets/css/calendar.min.css'
import { DatePicker } from './_components/calendar'

function App() {
    return (
        <>
            <div className="container">
                <div>
                    <h4>
                        Date Range Component for <span style={{ color: 'purple' }}>current month</span>
                    </h4>
                     <DatePicker restrictMonth={true} />
                </div>
                <div>
                    <h4>
                        Date Range Component for <span style={{ color: 'purple' }}>cross months</span>
                    </h4>
                    <DatePicker />
                </div>
            </div>
        </>
    )
}

export default App
