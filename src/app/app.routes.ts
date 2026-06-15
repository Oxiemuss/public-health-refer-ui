import { Routes,RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MainScreenComponent } from './pages/main-screen/main-screen.component';
import { HisScreenComponent } from './pages/his-screen/his-screen.component';
import { ListScreenComponent } from './pages/list-screen/list-screen.component';
import { CreateReferComponent } from './pages/create-refer/create-refer.component';

export const routes: Routes = [
{path:'', pathMatch:'full', redirectTo:'index'},
{path:'index', component:MainScreenComponent},
{path:'list', component:ListScreenComponent},
{path:'history', component:HisScreenComponent},
{path:'refer', component:CreateReferComponent},
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}