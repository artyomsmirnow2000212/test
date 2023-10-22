<template>
  <div>
    <div v-if="!secretContent">
      <textarea v-model="content"></textarea>
      <button @click="saveContent">Save</button>
      <p v-if="link">{{ link }}</p>
    </div>
    <div v-else>
      <h1>Ваш секретный контент</h1>
      <p>{{ secretContent }}</p>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      content: '',
      link: '',
      secretContent: '',
      address: window.location.pathname.substring(1),
    };
  },
  methods: {
    async saveContent() {
      try {
        const response = await fetch('http://localhost:3000/api/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: this.content })
        });

        const data = await response.json();
        this.link = data.link;
      } catch (error) {
        console.error(error);
      }
    },
    async getContent() {
      try {
        const hash = this.address;
        const response = await fetch('http://localhost:3000/api/'+ hash, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const data = await response.json();
        this.secretContent = data.decryptedContent;
      } catch (error) {
        console.log(error);
      }
    }
  },
  mounted() {
    if (this.address !== '') {
      this.getContent();
    }
  }
};
</script>