import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectApiService } from '../../project-api.service';
import { Project } from '../../task.model';
import { NotificationService } from '../../notification.service';
@Component({ selector:'app-projects-page', imports:[FormsModule], template:`<section class="projects"><h1>Mes projets</h1><p>Regroupez vos tâches par contexte.</p><form (ngSubmit)="create()"><input name="name" [(ngModel)]="name" placeholder="Ex. Formation" maxlength="80"><button [disabled]="!name.trim()">Créer un projet</button></form><p class="error">{{ error() }}</p><ul>@for (project of projects(); track project.id) { <li>{{ project.name }}</li> } @empty { <li>Aucun projet. Créez votre premier projet.</li> }</ul></section>`, styles:`.projects{width:min(760px,calc(100% - 40px));margin:54px auto}.projects h1{color:#172033}.projects form{display:flex;gap:10px;margin:24px 0}.projects input{flex:1;padding:11px;border:1px solid #cbd5e1;border-radius:10px}.projects button{padding:11px 14px;border:0;border-radius:10px;background:#172033;color:#fff}.projects li{padding:12px;border-bottom:1px solid #e2e8f0}.error{color:#b42318}` })
export class ProjectsPageComponent {
  private readonly api=inject(ProjectApiService); private readonly notifications=inject(NotificationService); protected readonly projects=signal<Project[]>([]); protected readonly error=signal(''); protected name='';
  constructor(){ this.load(); } load(){this.api.getProjects().subscribe({next:p=>this.projects.set(p),error:()=>this.error.set('Impossible de charger les projets.')});} create(){this.api.createProject(this.name.trim()).subscribe({next:p=>{this.projects.update(x=>[...x,p]);this.name='';this.notifications.success('Projet créé avec succès.');},error:()=>{this.error.set('Impossible de créer ce projet.');this.notifications.error('Impossible de créer ce projet.');}});}
}
