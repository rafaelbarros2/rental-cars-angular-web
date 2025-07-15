import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadAlugueisComponent } from './upload-alugueis.component';

describe('UploadAlugueisComponent', () => {
  let component: UploadAlugueisComponent;
  let fixture: ComponentFixture<UploadAlugueisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadAlugueisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadAlugueisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
