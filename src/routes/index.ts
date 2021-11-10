import type { Router } from 'express'
import temperature from './temperature'
import humidity from './humidity'

/**
 * Registers all the backend's routes to the provided express application.
 * @param {*} app The express application
 */
export default function (app: Router): void {
  // Routes may be subdivided.
  temperature(app)
  humidity(app)
}
