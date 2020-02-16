import { Service } from 'typedi';
import { Subject, Observable, Subscription } from 'rxjs';
import { bufferTime, map, filter } from 'rxjs/operators';

export enum LogLevel {
  Trace = 'Trace',
  Info = 'Info',
  Warn = 'Warn',
  Error = 'Error',
}

export interface LogMessage {
  level: LogLevel;
  scope: string;
  message: string;
  extra?: object;
  timestamp: number;
}

export interface LogSender {
  accpet?: LogLevel[];
  send(text: LogMessage): void;
}

export interface Logger {
  readonly scope: string;
  trace(message: string, extra?: object): void;
  info(message: string, extra?: object): void;
  warn(message: string, extra?: object): void;
  error(message: string, extra?: object): void;
}

const format = ({ level, scope, message, extra }: LogMessage) =>
  `[${scope}][${level}] ${message} ${extra ? JSON.stringify(extra) : ''}`;

@Service()
export class LoggerService {
  readonly buffer$: Observable<LogMessage[]>;

  private log = new Subject<LogMessage>();

  private subscriptions: Subscription[] = [];

  constructor() {
    this.buffer$ = this.log.pipe(bufferTime(100));

    this.addSender(
      { accpet: [LogLevel.Trace, LogLevel.Info], send: msg => console.log(format(msg)) },
      { accpet: [LogLevel.Warn], send: msg => console.warn(format(msg)) },
      { accpet: [LogLevel.Error], send: msg => console.error(format(msg)) }
    );
  }

  addSender(...senders: LogSender[]) {
    for (const sender of senders) {
      const subscription = this.buffer$
        .pipe(
          map(msgs => msgs.filter(msg => !sender.accpet || sender.accpet.includes(msg.level))),
          filter(msgs => msgs.length > 0)
        )
        .subscribe(msgs => msgs.forEach(sender.send));

      this.subscriptions.push(subscription);
    }
  }

  create(scope: string): Logger {
    return {
      scope,
      trace: this.trace.bind(this, scope),
      info: this.info.bind(this, scope),
      warn: this.warn.bind(this, scope),
      error: this.error.bind(this, scope),
    };
  }

  send(level: LogLevel, scope: string, message: string, extra?: object) {
    const timestamp = ~~(Date.now() / 1000);
    this.log.next({ level, scope, message, extra, timestamp });
  }

  trace(scope: string, message: string, extra?: object) {
    return this.send(LogLevel.Trace, scope, message, extra);
  }

  info(scope: string, message: string, extra?: object) {
    return this.send(LogLevel.Info, scope, message, extra);
  }

  warn(scope: string, message: string, extra?: object) {
    return this.send(LogLevel.Warn, scope, message, extra);
  }

  error(scope: string, message: string, extra?: object) {
    return this.send(LogLevel.Error, scope, message, extra);
  }
}
