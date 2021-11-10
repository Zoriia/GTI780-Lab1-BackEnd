import type { Router } from 'express'

import { temperature } from '../services'

/**
 * Registers all the backend's routes to the provided express application.
 * @param {*} app The express application
 */
export default function (app: Router): void {
  interface GetTemperatureParams {
    entries: number
  }

  app.get('/sensors/temperature', function (req, res, next) {
    temperature.getCurrentTemperature()
      .then(temp => res.status(200).json(temp))
      .catch(next)
  })

  app.get<GetTemperatureParams>('/sensors/temperature/:entries', function (req, res, next) {
    temperature.getTemperatureEntries(req.params.entries)
      .then(temp => res.status(200).json(temp))
      .catch(next)
  })

  app.get<GetTemperatureParams>('/sensors/temperature/:entries/avg', function (req, res, next) {
    temperature.getAverageTemperature(req.params.entries)
      .then(temp => res.status(200).json(temp))
      .catch(next)
  })
}
