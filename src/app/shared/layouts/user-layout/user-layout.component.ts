import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
// import { SearchFormComponent } from "../../components/user/search-form/search-form.component";


@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [ RouterOutlet, CommonModule],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.css'
})
export class UserLayoutComponent {

}
