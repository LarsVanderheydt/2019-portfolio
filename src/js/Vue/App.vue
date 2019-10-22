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

export default {
  beforeCreate() {
    fetch('../../assets/data/projects.json')
      .then(d => d.json())
      .then(data => data.map(project => this.projects.push(project)))
      .then(() => this.active = this.projects[0])
  },

  methods: {
    handleClick(e) {
      const active = e.target.id;
      const project = this.projects.find(p => p.id === active);
      this.active = project;
      this.colors.x = Math.random() * 1.0;
      this.colors.y = Math.random() * 1.0;
    }
  },

  data() {
    return {
      projects: [],
      active: null,
      colors: {
        x: null,
        y: null
      }
    }
  },

  components: {
    'Detail': Detail
  }
}
</script>
