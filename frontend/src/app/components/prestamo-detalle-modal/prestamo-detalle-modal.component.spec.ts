import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestamoDetalleModalComponent } from './prestamo-detalle-modal.component';

describe('PrestamoDetalleModalComponent', () => {
  let component: PrestamoDetalleModalComponent;
  let fixture: ComponentFixture<PrestamoDetalleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestamoDetalleModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestamoDetalleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
