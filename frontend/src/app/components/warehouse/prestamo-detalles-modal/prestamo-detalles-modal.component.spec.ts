import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestamoDetallesModalComponent } from './prestamo-detalles-modal.component';

describe('PrestamoDetallesModalComponent', () => {
  let component: PrestamoDetallesModalComponent;
  let fixture: ComponentFixture<PrestamoDetallesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestamoDetallesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestamoDetallesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
