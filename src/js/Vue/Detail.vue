<template>
  <div class="projects--info">
    <h2 class="projects--info--title">{{ project.name }}</h2>

    <p v-html="project.body"></p>

    <ul class="projects--info--urls">
      <li v-bind:key="url" v-for="(url, key) in project.urls">
        <a v-bind:href="url" target="_blank" v-bind:class="'icon--' + key"></a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    project: Object
  },

  created() {
    console.log(this.project.urls);
  }
}
</script>