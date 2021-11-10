import type { Router } from 'express'

import { humidity } from '../services'

export default function (app: Router): void {
  interface GetHumidityParams {
    entries: number
  }

  app.get('/sensors/humidity', function (req, res, next) {
    humidity.getCurrentHumidity()
      .then(humidity => res.status(200).json(humidity))
      .catch(next)
  })

  app.get<GetHumidityParams>('/sensors/humidity/:entries', function (req, res, next) {
    humidity.getHumidityEntries(req.params.entries)
      .then(humidity => res.status(200).json(humidity))
      .catch(next)
  })

  app.get<GetHumidityParams>('/sensors/humidity/:entries/avg', function (req, res, next) {
    humidity.getAverageHumidity(req.params.entries)
      .then(humidity => res.status(200).json(humidity))
      .catch(next)
  })
}
