import REvent from "./domain/REvent"
import React from "react"
import RRule from "rrule"

const event = new REvent({
  rrule: new RRule({
    freq: RRule.DAILY,
    dtstart: new Date(Date.UTC(2012, 1, 1, 10, 30)),
    until: new Date(Date.UTC(2012, 1, 7, 10, 30))
  }),
  overrides: {
    "2012-02-03T10:30:00.000Z": REvent.createPunctual({
      date: new Date(Date.UTC(2018, 1, 2, 10, 30)),
      payload: {
        name: "bob2"
      }
    })
  },
  exclusions: [new Date("2012-02-04T10:30:00.000Z")],
  additions: [
    new Date(Date.UTC(2015, 1, 2, 10, 30)),
  ],
  payload: {
    name: "bob",
  }
})

const App: React.FC = () => {
  const after = new Date(Date.UTC(2012, 1, 3, 10, 30))
  const before = new Date(Date.UTC(2012, 1, 7, 10, 30))
  const firstDate = new Date(Date.UTC(2012, 1, 5, 10, 30))
  const secondDate = new Date(Date.UTC(2012, 1, 8, 10, 30))
  const thirdDate = new Date(Date.UTC(2018, 1, 2, 10, 30))
  return (
    <div>
      <div><b>All</b></div>
      {event.all().map((date) => (
        <div>
          <span>{date.toISOString()}</span>
          <span>
            {JSON.stringify(event.getPayloadFor(date))}
          </span>
        </div>
      ))}

      <div><b>Between {after.toISOString()} - {before.toISOString()}</b></div>
      {event.between(
        after,
        before
      ).map((date) => (
        <div>
          <span>{date.toISOString()}</span>
          <span>
            {JSON.stringify(event.getPayloadFor(date))}
          </span>
        </div>
      ))}

      <div><b>For {firstDate.toISOString()}</b></div>
      {event.for(firstDate)! && (
        <div>
          <span>{event.for(firstDate)!.toISOString()}</span>
          <span>
            {JSON.stringify(event.getPayloadFor(event.for(
              firstDate,
            )!))}
          </span>
        </div>
      )}

      <div><b>For {secondDate.toISOString()}</b></div>
      {event.for(secondDate) && (
        <div>
          <span>{event.for(secondDate)!.toISOString()}</span>
          <span>
            {JSON.stringify(event.getPayloadFor(event.for(secondDate)!))}
          </span>
        </div>
      )}

      <div><b>For {thirdDate.toISOString()}</b></div>
      {event.for(thirdDate) && (
        <div>
          <span>{event.for(thirdDate)!.toISOString()}</span>
          <span>
            {JSON.stringify(event.getPayloadFor(event.for(thirdDate)!))}
          </span>
        </div>
      )}
    </div>
  )
}

export default App
