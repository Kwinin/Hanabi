import * as bunyan from 'bunyan'
import errSerializer from 'bunyan-serializer-error'
import {NextFunction, Request, Response} from 'express'
import {validationResult} from 'express-validator/check'
import * as loggerConfig from './logger'

const Logger = bunyan.createLogger({
  ...loggerConfig('middleware'),
  serializers: {
    ...bunyan.stdSerializers,
    err: errSerializer,
  },
} as any)

export interface IServicedRequest<T> extends Request {
  service: T
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    /* eslint-disable-next-line */
    interface Request {
      logger: bunyan
      getPage(): number
      getLimit(): number
    }
    /* eslint-disable-next-line */
    interface Response {
      missing(fields: string | string[]): this
    }
  }
}

export function Middleware(req: Request, res: Response, next: NextFunction): void {
  res.missing = (field: string | string[]): Response => {
    return res.status(400)
      .json({
        message: `missing ${field.toString()}`,
      })
  }
  req.logger = Logger.child({req})
  req.getPage = () => Math.max(req.query.page, 1) || 1
  req.getLimit = () => Math.min(req.query.limit, 500) || 10
  next()
}

export function checkValidationResult(req: Request, res: Response, next: NextFunction): void {
  const validation = validationResult(req)
  if (!validation.isEmpty()) {
    res.status(400)
      .json(validation.mapped())
    return
  }
  next()
}
