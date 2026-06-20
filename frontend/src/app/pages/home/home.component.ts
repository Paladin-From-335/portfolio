import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { SelectedSectionComponent } from './components/selected-section/selected-section.component';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, SelectedSectionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
