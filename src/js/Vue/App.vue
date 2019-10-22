<template>
  <div class="projects">
    <transition-group name="list" class="projects--list" tag="ul">
      <li v-bind:key="project.id" v-for="project in projects">
        <button @click="handleClick" v-bind:id="project.id">{{ project.name }}</button>
      </li>
    </transition-group>

    <Detail v-if="active" v-bind:project="active"></Detail>
  </div>
</template>

<script>
import Detail from './Detail.vue';
import MouseEffect from '../MouseEffect';

const params = {
  webGLCanvasID: "canvas",
  planeElementID: "backgrounds",

  // TWEAK THOSE VALUES TO CHANGE OVERALL EFFECT

  // size of the effect (0: no effect, 1: full window)
  pointerSize: 0.02,
  // how much to increase/decrease opacity on each frame
  opacitySpeed: 0.025,
  // strength of the velocity of the mouse effect
  velocityStrength: 0.125,
  // the bigger the more displacement
  displacementStrength: 0.125,
  // does not change anything visually, but the smaller the scale the better the performance
  canvasScale: 0.525,
  colors: [0.5, 1.0]
}
const mouseEffect = new MouseEffect(params);

export default {
  beforeCreate() {
    fetch('../../assets/data/projects.json')
      .then(d => d.json())
      .then(data => data.map(project => this.projects.push(project)))
      .then(() => this.active = this.projects[0])
  },

  created() {
    // init everything


    // if there's an error during the WebGL context creation
    mouseEffect.curtains.onError(() => {
      document.body.classList.add("no-webgl");
    });

    // add the plane to start the effect
    mouseEffect.addPlane();

  },

  methods: {
    handleClick(e) {
      const active = e.target.id;
      const project = this.projects.find(p => p.id === active);
      this.active = project;
      mouseEffect.updateColors(Math.random() * 1.0, Math.random() * 1.0);
    }
  },

  data() {
    return {
      projects: [],
      active: null,
    }
  },

  components: {
    'Detail': Detail
  }
}
</script>
