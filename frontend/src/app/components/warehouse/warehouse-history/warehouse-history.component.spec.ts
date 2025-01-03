import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseHistoryComponent } from './warehouse-history.component';

describe('WarehouseHistoryComponent', () => {
  let component: WarehouseHistoryComponent;
  let fixture: ComponentFixture<WarehouseHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
