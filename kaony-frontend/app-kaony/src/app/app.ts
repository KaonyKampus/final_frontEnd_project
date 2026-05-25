import { Component, ElementRef, ViewChild, afterNextRender } from '@angular/core';
import * as THREE from 'three';
import { Title } from './components/title/title'; 
import { CommonModule } from '@angular/common';

interface Poema {
  id: number;
  titulo: string;
  desc: string;
  img: string;
  contenido: string[];
}

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
  private mouse = new THREE.Vector2();
  
  public appLoaded = false;    
  public isInGallery = false;  
  public isModalOpen = false;  
  
  // Control de pestañas: 'menu' (inicio), 'autor' (derecha), 'poemas' (abajo)
  public currentTab: 'menu' | 'autor' | 'poemas' = 'menu';

  // Guarda el poema que el usuario está leyendo en el modal
  public poemaSeleccionado: Poema | null = null;

  // LISTADO DE POEMAS CON TUS ESCRITOS COMPLETOS
  public poemas: Poema[] = [
    { 
      id: 1, 
      titulo: 'Schmetterling', 
      desc: 'Metamorfosis y el efímero aleteo del caos.', 
      img: 'Schmetterling.jpeg',
      contenido: [
        'Mariposa hermosa, Schmetterling le digo yo, le digo Schmetterling porque está escrita en alemán',
        'y el alemán es muy lógico entonces creo que la lógica es que mi amor por ti surgió, cuando ',
        'admiramos todo, mi bella Schmetterling. Te acuerdas de la casa de colibríes y de los paisajes llenos',
        'de verde, te acuerdas de todo lo que surgimos desde el sol y la mañana hasta la noche y cuando',
        'llueve. Schmetterling, es un placer disfrutar de tu existencia, aunque en mi vida haya sido tan',
        'corta. Tu transformación, tu metamorfosis ahí no para, como la mía tampoco. Quién diría que el',
        'cucarrón con una mariposa conviviría, el cucarrón que, aunque sabe volar del suelo no pasa, pero',
        'con la mariposa aprendió a conocer con lo que los pies no se alcanzan. Hoy dejo de ser cucarrón',
        'para convertirme en pájaro. Para convertirme en halcón exactamente, tengo que ser solitario y',
        'volar libremente. Y tu mariposa bella, mein bunter Schmetterling, mi color de mundos, mi',
        'compañía más preciada, hoy te dejo. ¿Te dejo sabes por qué? Porque ya es hora de que vueles ',
        'más alto y que te conviertas en hada. Me dijiste un día que yo era tu Schutzengel y eso por nada',
        'del mundo cambia. Ni nuestro amor morirá, ni tu caerás, ni yo caeré, ni caeremos, solo seguiremos ',
        'moviéndonos como dos partículas que una vez fueron uno, yo con tus alas tu con las mías siempre',
        'recorreremos nuevos caminos. Mein Schmetterling yo se que es lo que pasa, discúlpame ya no',
        'puedo verte el rostro porque mi ceguera avanza. Pero te recuerdo como la más hermosa de las',
        'mariposas, la más perfecta con alas rotas, la mas colorida aparentemente peligrosa, pero tierna',
        'más que lo más tierno con mirada de perla preciosa.'
      ]
    },
    { 
      id: 2, 
      titulo: 'La petite mort', 
      desc: 'El breve éxtasis donde el tiempo se detiene.', 
      img: 'la petite mort.png',
      contenido: [
        'Esa noche solamente la oscuridad nos abrigó, después de un par de palabras cruzadas y un poco ',
        'de frío todo comenzó. Me encanta la curvatura de esa sonrisa, esos gestos, esos movimientos, ese ',
        'rose, y al terminar esas caricias. La noche fue larga, pero nos quedó pequeña tú enternecida en',
        'sueño y yo despertando fieras. Una noche donde el nervio se vio presente, pero inmediatamente ',
        'cerramos la puerta el universo cambió, se transformó, la cama no era cama era cielo, el tiempo no',
        'era tiempo solo estábamos estáticos. Ya no fue una manzana, ya no fue pecado, ya no fue',
        'tormento, más bien fue una paz total que se dio en un solo encuentro. Perfecta de pies a cabeza,',
        'como conocer los querubines, ¿más que un cuerpo desnudo, you know? It’s crazy because you ',
        'surprised me, I don’t know if you felt the same. As soon as you dominated me and you were on',
        'me, I just felt that sensation. We were one for one night. Y así paso, uno solo como uniendo más',
        'que nuestros cuerpos, nuestros espíritus. E c’est ça. C\'est peut-être la sensation que j\'ai ressentie ',
        'cette nuit-là, je ne savais pas si j\'avois surmonté le charnel. Est-ce que ça puede se transformer ',
        'en amour?',
        '',
        'No lo sé, solo sé cómo el viento que voy con brisa fresca apagando tus candelas y encendiendo tus ',
        'velas.'
      ]
    },
    { 
      id: 3, 
      titulo: 'Wave of feelings', 
      desc: 'Frecuencias emocionales rompiendo en la costa de la mente.', 
      img: 'wave of feelings.jpg',
      contenido: [
        'I know that I am a human being even when I am in the darkness thinking about all the time I spend ',
        'thinking. It is like a feeling that just comes to my mind. And let me tell you. I am thinking of you as ',
        'much as I am thinking about me and all the time we’ve been talking. This could be my most ',
        'difficult part to show. But tonight, I just want to do it because I am a poet as you may have',
        'realized already. I really like that presence in my life. I remember January, I remember every day, I',
        'take into account every single moment and fact even if they seem to be small or just without',
        'value, and if I do not remember them, I just come back into mind to see all those memories again.',
        'Today is a little bit sad but is not because of you, is just because of life. This is most likely my',
        'weakness during some days of happiness. Darling, you are amazing and if I write to you about',
        'erotic things, I can also write to you about love and kindness. You are perfect to me. I know it isn’t ',
        'been enough time, and you and I just met some nights ago. But it was enough for me to realize ',
        'many things. You make me think that love is really there on earth, that basically it really exists, I’m',
        'surrounded by a wave of feelings. I was forgotten by the tinny stars, but I was lifted by a gorgeous',
        'and shiny sun; you.'
      ]
    },
    { 
      id: 4, 
      titulo: 'Juego de palabras', 
      desc: 'Laberintos lingüísticos y verdades ocultas entre rimas.', 
      img: 'juegodepalabras.jpg',
      contenido: [
        'Fui peón en acuacero que no escampa y como león que no tiene manada tuve que ',
        'sobrevivir, por eso este va para mí;',
        '',
        '        Soy escritor, artista, programador, de disciplina acechador,',
        '        sensible como Goethe, macabro como Poe,',
        '        líder como Napoleón, optimista, soñador, creativo,',
        '        amador, de buen humor cuando estoy en la mía, ',
        '        y para muchos en su vida yo soy la guía.',
        '        No soy show off, yo soy humilde,',
        '        con los míos protector,',
        '        con frecuencí disciplinado, justo, perseverante y determinado',
        '        no soy un princi, soy recursivo, resolutivo y curioso como DaVinci.',
        '        La confianza para mi es lo más importante,',
        '        por eso mismo es que soy perseverante.',
        '',
        '        Tengo mi sello, mi propia marca,',
        '        mi juego de palabras personal,',
        '        yo soy poemas lo que me abarca ',
        '        para ser un animal racional.'
      ]
    },
    { 
      id: 5, 
      titulo: 'Ma petite morte', 
      desc: 'Ecos de una ausencia que aún respira en la penumbra.', 
      img: 'masturbacion.jpg',
      contenido: [
        'Estuve en ese estado de calor perpetuo subiendo y bajando por mi cuenta. Aunque estaba',
        'acostado sentía como mi cuerpo flotaba por las nubes. Mis manos continuaban en un movimiento ',
        'que parecía no terminar, pero era algo mecánico porque mi cuerpo todo lo hacía y mi mente solo        ',
        'flotaba solo imaginaba, imaginaba ese tatuaje en forma de mariposa corazón, imaginaba esas',
        'nalgas, me imaginaba a mí mismo recorriendo por esos caminos, me imaginaba montando ese',
        'culo pomposo. Mi mente solo se dejaba llevar por las luces que a mi parecer eran estrellas. De ',
        'pronto nada existía, de pronto todo era un background negro, como el espacio. Fue como ese',
        'mundillo donde habité antes de nacer, antes de venir a este mundo. Luego de ver todo negro sin',
        'una luz, aunque con estrellas en la lejanía. Vi muchos colores, colores de diferentes texturas porque',
        'los podía tocar. De pronto iba terminando lo sabía, algo me recorría las piernas. Algo que era',
        'caliente, pero se iba haciendo frío a medida que iba recorriéndome. Al terminar sentí felicidad el',
        'alma volvió a mi cuerpo, y solo pensé en que ya no debería existir en que debía morir ',
        'inmediatamente, si morir era vivir en ese placer eterno, si morir era volver a sentir…',
        '',
        '        Kaony Kampus (Poeta de media noche) I won’t stop, I’ll keep this on my road…'
      ]
    },
    { 
      id: 6, 
      titulo: 'Luna 2.0', 
      desc: 'Reflejo plateado de la locura y los monólogos nocturnos.', 
      img: 'luna poema.jpg',
      contenido: [
        'Hermosa compañía que mi camino alumbró,',
        'Me mostró todos los cielos habidos y por haber,',
        'me hizo querer la noche hasta el amanecer',
        'y en las noches obscuras nunca me abandonó.',
        '',
        'Luna, luna hermosa, radiante, de eclipse, rojiza,',
        'luna amante, luna protectora, sincera, amatista.',
        'Este poeta ama todas las perlas de tu sonrisa',
        'y, aunque imperfecta, ama todas tus partes vistas.',
        '',
        'Luna, luna, luna ¡Por favor préstame atención!',
        'que en ese lunarcito bajo tu nariz me pierdo yo.',
        'Luna, luna, ya tengo que irme ',
        'pero tus ojos siempre quedarán en mi canción.',
        '',
        'Hermosa compañía que se quedó en menguante,',
        'por darme su amor yo siendo su amante,',
        'me voy; pero las estrellas quedan manifestantes ',
        '        y sé que en estos duros instantes ',
        '        tendrás que ser luna nueva con preguntas constantes  ',
        '        pero volverás a ser luna llena ',
        '        y tu luz será más radiante.',
        '',
        'Porque yo también me iré a conquistar otros cielos, ',
        'a conquistar otras partes, otras menguantes, ',
        'que tal vez le enseñen nuevas cosas',
        'a mis poemas andantes.'
      ]
    }
  ];

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
    this.pyramid = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({
      color: 0x9d00ff, transparent: true, opacity: 0.95, metalness: 0.9, roughness: 0.1, emissive: 0x2a0052, emissiveIntensity: 0.5, side: THREE.DoubleSide
    }));
    this.pyramid.scale.set(0, 0, 0); 
    this.scene.add(this.pyramid);

    this.starPoints = this.createInteractiveStarField(4000, 75);
    this.scene.add(this.starPoints);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const frontLight = new THREE.DirectionalLight(0xffffff, 2.2);
    frontLight.position.set(0, 0, 10); 
    this.scene.add(frontLight);
  }

  private setupEventListeners(): void {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.poemaSeleccionado) {
          this.cerrarPoema();
        } else if (this.isModalOpen) {
          this.exitGallery();
        }
      }
    });
  }

  public enterGallery(): void {
    this.isInGallery = true;
    this.isModalOpen = true; 
    this.currentTab = 'menu';
    setTimeout(() => {
      window.scrollTo({ top: window.innerHeight * 0.5, behavior: 'smooth' });
      this.targetScale = 0; 
      this.targetZ = 2;     
    }, 100);
  }

  public exitGallery(): void {
    this.isModalOpen = false;
    this.isInGallery = false;
    this.targetScale = 1; 
    this.targetZ = 7;     
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public irAAutor(): void { this.currentTab = 'autor'; }
  public irAPoemas(): void { this.currentTab = 'poemas'; }
  public regresarAlMenu(): void { this.currentTab = 'menu'; }

  public abrirPoema(poema: Poema): void {
    this.poemaSeleccionado = poema;
  }

  public cerrarPoema(): void {
    this.poemaSeleccionado = null;
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    const time = Date.now() * 0.001; 
    this.currentScale = THREE.MathUtils.lerp(this.currentScale, this.targetScale, 0.08);
    this.pyramid.scale.set(this.currentScale, this.currentScale, this.currentScale);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, this.targetZ, 0.05);
    if (!this.isInGallery) {
      this.pyramid.rotation.y += this.rotationSpeed;
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
    this.starOriginalPositions = new Float32Array(count * 3);
    for(let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spread;
      const y = (Math.random() - 0.5) * spread;
      const z = (Math.random() - 0.5) * spread;
      positions.set([x, y, z], i * 3);
      this.starOriginalPositions.set([x, y, z], i * 3);
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.12, color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending }));
  }
}