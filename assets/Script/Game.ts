import Cell, { State } from './Cell'

const { ccclass, property } = cc._decorator
const CellSiblings = [
  { x: -1, y: 0 }, // left
  { x: -1, y: 1 }, // top left
  { x: 0, y: 1 },  // top
  { x: 1, y: 1 },  // top right
  { x: 1, y: 0 },  // right
  { x: 1, y: -1 }, // bottom right
  { x: 0, y: -1 }, // bottom
  { x: -1, y: -1 } // bottom left
]

@ccclass
export default class Game extends cc.Component {

  @property(cc.Node)
  cellArea: cc.Node = null

  @property(cc.Prefab)
  cellPrefab: cc.Prefab = null

  @property(cc.Node)
  buttonNode: cc.Node = null

  @property(cc.Integer)
  speed: number = .1

  private _timer = 0
  private _runing: boolean = false
  private _maxCellWidth: number = 80
  private _maxCellHeight: number = 68
  private _cellWidth: number = 10
  private _cellMetrix: Array<Array<Cell>> = []

  onLoad() {
    this.cellArea.on('touchstart', this._onTouchStart, this)
    this._init()
  }

  onDestroy() {
    this.cellArea.off('touchstart', this._onTouchStart, this)
  }

  public toggleGameStatus(): void {
    this._runing = !this._runing
    const label = this.buttonNode.getComponentInChildren(cc.Label)
    label.string = this._runing ? 'Pause' : 'Start'
  }

  public resetGame(): void {
    this._runing = false
    const label = this.buttonNode.getComponentInChildren(cc.Label)
    label.string = 'Start'
    for (let r = 0; r < this._maxCellWidth; r++) {
      for (let c = 0; c < this._maxCellHeight; c++) {
        this._cellMetrix[r][c].setState(State.dead)
      }
    }
  }

  public onSliderChanged(slide: cc.Slider): void {
    console.log(slide.progress)
    this.speed = Math.max(0.016, slide.progress)
  }

  private _init(): void {
    for (let r = 0; r < this._maxCellWidth; r++) {
      this._cellMetrix[r] = []
      for (let c = 0; c < this._maxCellHeight; c++) {
        const cellNode: cc.Node = cc.instantiate(this.cellPrefab)
        this.cellArea.addChild(cellNode)
        cellNode.setPosition(cc.v2(r * this._cellWidth, c * this._cellWidth))
        const cell: Cell = cellNode.getComponent(Cell)
        cell.setState(State.dead)
        this._cellMetrix[r][c] = cell
      }
    }
  }

  private _onTouchStart(evt: cc.Event.EventTouch): void {
    if (this._runing) return
    let pos: cc.Vec2 = evt.getLocation()
    pos = this.cellArea.convertToNodeSpaceAR(pos)
    const r: number = Math.floor(pos.x / this._cellWidth)
    const c: number = Math.floor(pos.y / this._cellWidth)
    this._cellMetrix[r][c].toggleState()
  }

  private _checkLiveCellState(): void {
    for (let r = 0; r < this._maxCellWidth; r++) {
      for (let c = 0; c < this._maxCellHeight; c++) {
        this._setCellNextState(this._cellMetrix[r][c])
      }
    }

    // update metrix
    for (let r = 0; r < this._maxCellWidth; r++) {
      for (let c = 0; c < this._maxCellHeight; c++) {
        this._cellMetrix[r][c].updateState()
      }
    }
  }

  private _setCellNextState(cell: Cell): void {
    let liveCells: number = 0
    for (let { x, y } of CellSiblings) {
      let r: number = cell.node.x / this._cellWidth + x
      let c: number = cell.node.y / this._cellWidth + y
      if (r < 0) {
        r = this._maxCellWidth - 1
      }
      if (r >= this._maxCellWidth) {
        r = 0
      }
      if (c < 0) {
        c = this._maxCellHeight - 1
      }
      if (c >= this._maxCellHeight) {
        c = 0
      }
      const sibling: Cell = this._cellMetrix[r][c]
      if (sibling.getState() === State.alive) liveCells++
    }

    // make cell live
    if (liveCells === 3) {
      cell.setNextState(State.alive)
    }

    // keep state
    if (liveCells === 2) {
      cell.setNextState(cell.getState())
    }

    // cell will dead in other situations
  }

  update(dt: number) {
    if (!this._runing) return
    this._timer += dt
    if (this._timer >= this.speed) {
      this._timer = 0
      this._checkLiveCellState()
    }
  }
}
