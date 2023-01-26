export class RandomChartValuesGenerator {
  moveTo: 'up' | 'down' = 'up';
  currentStep = 0;
  highestPoint!: number;
  lowestPoint!: number;
  stepUp!: number;
  stepDown!: number;
  currHightestPointsCount = 0;
  length!: number;
  hightestPointsCount!: number | undefined;

  private readonly ERROR_MAX!: number;
  private readonly ERROR_MIN!: number;
  private readonly HIGHEST_POINT_MAX!: number;
  private readonly HIGHEST_POINT_MIN!: number;
  private readonly LOWEST_POINT_MAX!: number;
  private readonly LOWEST_POINT_MIN!: number;

  constructor(
    length: number,
    hightestPointsCount?: number,
    options?: {
      ERROR_MAX?: number;
      ERROR_MIN?: number;
      HIGHEST_POINT_MAX?: number;
      HIGHEST_POINT_MIN?: number;
      LOWEST_POINT_MAX?: number;
      LOWEST_POINT_MIN?: number;
    },
  ) {
    this.length = length;
    this.hightestPointsCount = hightestPointsCount;
    this.ERROR_MAX = options?.ERROR_MAX || 200;
    this.ERROR_MIN = options?.ERROR_MAX || -200;
    this.HIGHEST_POINT_MAX = options?.HIGHEST_POINT_MAX || 5000;
    this.HIGHEST_POINT_MIN = options?.HIGHEST_POINT_MIN || 1000;
    this.LOWEST_POINT_MAX = options?.LOWEST_POINT_MAX || 3000;
    this.LOWEST_POINT_MIN = options?.LOWEST_POINT_MIN || 0;

    this.updateChartOptions();
  }

  updateChartOptions(): void {
    if (this.hightestPointsCount && this.currHightestPointsCount >= this.hightestPointsCount) {
      this.highestPoint = this.HIGHEST_POINT_MIN;
      this.lowestPoint = this.LOWEST_POINT_MIN;
      this.stepUp = 0;
      this.stepDown = this.ERROR_MAX;
      return;
    }

    this.highestPoint = Math.floor(
      Math.random() * (this.HIGHEST_POINT_MAX - this.HIGHEST_POINT_MIN) + this.HIGHEST_POINT_MIN,
    );
    this.lowestPoint = Math.floor(
      Math.random() * (this.LOWEST_POINT_MAX - this.LOWEST_POINT_MIN) + this.LOWEST_POINT_MIN,
    );
    this.stepUp = Math.random() * (this.ERROR_MAX - 1) + 1;
    this.stepDown = Math.random() * (this.ERROR_MAX - 1) + 1;

    if (this.lowestPoint > this.highestPoint) {
      this.lowestPoint = 0;
    }

    if (this.hightestPointsCount) {
      this.currHightestPointsCount++;
    }
  }

  getChartData(): number[] {
    const res: number[] = [];
    new Array(this.length).fill(1).map((_, i) => {
      const error = Math.floor(Math.random() * (this.ERROR_MAX - this.ERROR_MIN) + this.ERROR_MIN);
      if (this.moveTo === 'up') {
        res.push(this.currentStep + error);
        this.currentStep += this.stepUp;

        if (this.currentStep >= this.highestPoint) {
          this.moveTo = 'down';
          this.updateChartOptions();
        }
      }

      if (this.moveTo === 'down') {
        res.push(this.currentStep + error);
        this.currentStep -= this.stepDown;

        if (this.currentStep <= this.lowestPoint) {
          this.moveTo = 'up';
        }
      }
    });

    this.resetChartOptions();

    return res;
  }

  resetChartOptions() {
    this.highestPoint = 0;
    this.lowestPoint = 0;
    this.stepUp = 0;
    this.stepDown = 0;
  }
}
