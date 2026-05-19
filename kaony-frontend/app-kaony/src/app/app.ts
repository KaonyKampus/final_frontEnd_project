import { Component, ElementRef, ViewChild, afterNextRender } from '@angular/core';
import * as THREE from 'three';
import { Title } from './components/title/title'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Title, CommonModule], 
  templateUrl: './app.html', 
  styleUrls: ['./app.css']
})
export class App {
  @ViewChild('rendererCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private pyramid!: THREE.Mesh; 
  
  private starPoints!: THREE.Points;
  private starOriginalPositions!: Float32Array;
  
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  
  public appLoaded = false;    
  public isInGallery = false; // Estado para controlar la visibilidad del prisma y otros componentes
  
  private targetZ = 7;      
  private currentScale = 0;    
  private targetScale = 1;     
  private rotationSpeed = 0.008;

  constructor() {
    afterNextRender(() => {
      try {
        this.initThree();
        this.setupEventListeners();
        this.animate();
        setTimeout(() => { this.appLoaded = true; }, 500);
      } catch (err) {
        console.error("Error en Kaony Kampus:", err);
      }
    });
  }

  private initThree(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = this.targetZ; 

    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvasRef.nativeElement, 
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.ConeGeometry(2.2, 3.8, 4); 
    geometry.clearGroups();
    geometry.addGroup(0, geometry.attributes['position'].count, 0); 

    const materialSolido = new THREE.MeshPhysicalMaterial({
      color: 0x9d00ff,      
      transparent: true,
      opacity: 0.95,        
      metalness: 0.9,       
      roughness: 0.1,      
      emissive: 0x2a0052,   
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide
    });

    this.pyramid = new THREE.Mesh(geometry, materialSolido);
    this.pyramid.scale.set(0, 0, 0); 
    this.scene.add(this.pyramid);

    this.starPoints = this.createInteractiveStarField(4000, 75);
    this.scene.add(this.starPoints);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const frontLight = new THREE.DirectionalLight(0xffffff, 2.2);
    frontLight.position.set(0, 0, 10); 
    this.scene.add(frontLight);
    
    const topLight = new THREE.PointLight(0x00ffff, 60);
    topLight.position.set(5, 5, 5);
    this.scene.add(topLight);
  }

  private setupEventListeners(): void {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('click', () => {
      if (this.isInGallery) return; // Si ya entró, ignorar clicks en el prisma

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObject(this.pyramid);
      
      if (intersects.length > 0) {
        this.enterGallery();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isInGallery) {
        this.exitGallery();
      }
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // Lógica para "entrar"
  private enterGallery(): void {
    this.isInGallery = true;
    this.targetScale = 0; // El prisma se encoge hasta desaparecer
    this.targetZ = 2;     // La cámara se acerca un poco para dar efecto de inmersión
  }

  // Lógica para "salir" (opcional, con tecla Escape)
  private exitGallery(): void {
    this.isInGallery = false;
    this.targetScale = 1;
    this.targetZ = 7;
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    const time = Date.now() * 0.001; 
    
    // Suavizado del escalado y posición de cámara
    this.currentScale = THREE.MathUtils.lerp(this.currentScale, this.targetScale, 0.08);
    this.pyramid.scale.set(this.currentScale, this.currentScale, this.currentScale);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, this.targetZ, 0.05);

    if (!this.isInGallery) {
      this.pyramid.rotation.y += this.rotationSpeed;
      this.pyramid.rotation.x = Math.sin(time * 0.4) * 0.12;
    }

    this.renderer.render(this.scene, this.camera);
    this.updateStars(time);
  }

  private updateStars(time: number): void {
    const posAttr = this.starPoints.geometry.attributes['position'];
    for (let i = 0; i < posAttr.count; i++) {
      let x = this.starOriginalPositions[i * 3] + Math.sin(time + i) * 0.1 + this.mouse.x * 1.5;
      let y = this.starOriginalPositions[i * 3 + 1] + Math.cos(time + i * 1.1) * 0.1 + this.mouse.y * 1.5;
      posAttr.setXY(i, x, y);
    }
    posAttr.needsUpdate = true;
  }

  private createInteractiveStarField(count: number, spread: number): THREE.Points {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.starOriginalPositions = new Float32Array(count * 3);
    const colorPool = [new THREE.Color(0xffffff), new THREE.Color(0x00ffff), new THREE.Color(0xbd00ff)];
    for(let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spread;
      const y = (Math.random() - 0.5) * spread;
      const z = (Math.random() - 0.5) * spread;
      positions.set([x, y, z], i * 3);
      this.starOriginalPositions.set([x, y, z], i * 3);
      const color = colorPool[Math.floor(Math.random() * colorPool.length)];
      colors.set([color.r, color.g, color.b], i * 3);
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending }));
  }
}