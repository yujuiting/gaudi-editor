import { Service } from 'typedi';
import * as array from 'base/array';
import { KeyboardService } from 'base/KeyboardService';
import { LoggerService, Logger } from 'base/LoggerService';

export interface Keybinding {
  id: string;
  parts: string[];
  onEnter?: () => void;
  onLeave?: () => void;
}

@Service()
export class KeybindingService {
  private keybindings = new Array<Keybinding>();

  private current: Keybinding | null = null;

  private buffer: string[] = [];

  private logger: Logger;

  constructor(keyboardService: KeyboardService, logger: LoggerService) {
    this.logger = logger.create('KeybindingService');

    keyboardService.keydown$
      // prevent fire same key repeatly and reset after key up
      // .pipe(distinct(e => e.code, keyboardService.keyup$))
      .subscribe(e => this.onKeydown(e));

    keyboardService.keyup$.subscribe(() => this.onKeyup());
  }

  define(keybinding: Keybinding) {
    this.keybindings.push(keybinding);
  }

  private onKeydown(e: KeyboardEvent) {
    const { code, metaKey, altKey, ctrlKey, shiftKey } = e;
    if (metaKey) this.pushBuffer('Meta');
    if (altKey) this.pushBuffer('Alt');
    if (ctrlKey) this.pushBuffer('Ctrl');
    if (shiftKey) this.pushBuffer('Shift');
    /**
     * @TODO refactor follows shit
     */
    if (!/(Meta|Alt|Ctrl|Shift)/.test(code)) {
      if (!this.pushBuffer(code) && this.current) {
        this.onEnterKeybinding(this.current);
      }
    }
    if (this.current) {
      e.preventDefault();
    }
  }

  private onKeyup() {
    this.clearBuffer();
  }

  private pushBuffer(code: string) {
    if (this.buffer.indexOf(code) >= 0) return false;
    this.buffer.push(code);
    this.logger.trace('pushBuffer', { code, buffer: this.buffer });
    for (const keybinding of this.keybindings) {
      if (array.shallowEqual(keybinding.parts, this.buffer)) {
        return this.setCurrent(keybinding);
      }
    }
    return false;
  }

  private clearBuffer() {
    this.buffer = [];
    this.setCurrent(null);
    this.logger.trace('clearBuffer', { buffer: this.buffer });
  }

  private setCurrent(current: Keybinding | null) {
    if (current === this.current) return false;

    this.logger.trace('setCurrent', { parts: current?.parts });

    if (this.current) {
      this.onLeaveKeybinding(this.current);
    }

    if (current) {
      this.onEnterKeybinding(current);
    }

    this.current = current;

    return true;
  }

  private onEnterKeybinding(keybinding: Keybinding) {
    if (keybinding.onEnter) {
      keybinding.onEnter();
    }
  }

  private onLeaveKeybinding(keybinding: Keybinding) {
    if (keybinding.onLeave) {
      keybinding.onLeave();
    }
  }
}
