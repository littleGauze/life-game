const { ccclass, property } = cc._decorator

export enum State {
  dead,
  alive
}

@ccclass
export default class Cell extends cc.Component {

  private _innerNode: cc.Node = null
  private _value: number = 0

  onLoad() {
    this._innerNode = cc.find('inner', this.node)
  }

  public setNextState(nextState: State): void {
    this._value = nextState === State.alive ? this._value | 2 : this._value
  }

  public getState(): State {
    return this._value & 1 ? State.alive : State.dead
  }

  public setState(state: State): void {
    this._value = state
    this._innerNode.color = state === State.alive ? cc.Color.BLACK : cc.Color.WHITE
  }

  public updateState(): void {
    this._value >>= 1
    this.setState(this._value)
  }

  public toggleState(): void {
    this.setState(this.getState() === State.alive ? State.dead : State.alive)
  }
}
