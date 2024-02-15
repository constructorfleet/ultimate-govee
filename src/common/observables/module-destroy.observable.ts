import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class ModuleDestroyObservable
  extends Subject<void>
  implements OnModuleDestroy
{
  onModuleDestroy() {
    this.next();
    this.complete();
  }
}
