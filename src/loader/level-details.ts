import Fragment, { Part } from './fragment';
import type AttrList from '../utils/attr-list';

const DEFAULT_TARGET_DURATION = 10;

export default class LevelDetails {
  public PTSKnown?: boolean;
  public availabilityDelay?: number; // Manifest reload synchronization
  public averagetargetduration?: number;
  public endCC: number = 0;
  public endSN: number = 0;
  public fragments: Fragment[];
  public partList: Part[] | null = null;
  public initSegment: Fragment | null = null;
  public lastModified?: number;
  public live: boolean = true;
  public needSidxRanges: boolean = false;
  public startCC: number = 0;
  public startSN: number = 0;
  public startTimeOffset: number | null = null;
  public targetduration: number = 0;
  public tload?: number;
  public totalduration: number = 0;
  public type: string | null = null;
  public updated: boolean = true;
  public advanced: boolean = true;
  public misses: number = 0;
  public url: string;
  public m3u8: string = '';
  public version: number | null = null;
  public canBlockReload: boolean = false;
  public canSkipUntil: number = 0;
  public canSkipDateRanges: boolean = false;
  public skippedSegments?: number;
  public recentlyRemovedDateranges?: string[];
  public partHoldBack: number = 0;
  public holdBack: number = 0;
  public partTarget: number = 0;
  public preloadHint?: AttrList;
  public renditionReports?: AttrList[];
  public tuneInGoal: number = 0;

  constructor (baseUrl) {
    this.fragments = [];
    this.url = baseUrl;
  }

  reloaded (previous: LevelDetails | undefined) {
    if (!previous) {
      this.advanced = true;
      this.updated = true;
      return;
    }
    const partSnDiff = this.lastPartSn - previous.lastPartSn;
    const partIndexDiff = this.lastPartIndex - previous.lastPartIndex;
    this.updated = this.endSN !== previous.endSN || !!partIndexDiff || !!partSnDiff;
    this.advanced = this.endSN > previous.endSN || partSnDiff > 0 || (partSnDiff === 0 && partIndexDiff > 0);
    if (this.updated || this.advanced) {
      this.misses = Math.floor(previous.misses * 0.6);
    } else {
      this.misses = previous.misses + 1;
    }
    this.availabilityDelay = previous.availabilityDelay;
  }

  get hasProgramDateTime (): boolean {
    return !!this.fragments[0] && Number.isFinite(this.fragments[0].programDateTime as number);
  }

  get levelTargetDuration (): number {
    return this.averagetargetduration || this.targetduration || DEFAULT_TARGET_DURATION;
  }

  get age (): number {
    if (this.lastModified) {
      return (Date.now() - this.lastModified) / 1000;
    }
    return 0;
  }

  get lastPartIndex (): number {
    if (this.partList) {
      return this.partList[this.partList.length - 1].index;
    }
    return -1;
  }

  get lastPartSn (): number {
    if (this.partList) {
      return this.partList[this.partList.length - 1].fragment.sn as number;
    }
    return this.endSN;
  }
}
