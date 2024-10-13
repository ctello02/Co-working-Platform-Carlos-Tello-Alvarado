<template>
    <v-card class="pa-10 container" outlined>
      <v-form
        ref="form"
        v-model="valid"
        @submit.prevent="handleSubmit"
      >
        <v-row>
          <v-col cols="12">
            <h2 class="title">Change Password</h2>
          </v-col>
        </v-row>
  
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="password"
              label="New Password"
              type="password"
              required
              :rules="passwordRules"
              autocomplete="new-password"
              outlined
            />
          </v-col>
        </v-row>
  
        <v-row>
          <v-col cols="12">
            <v-btn
              class="cta-btn"
              color="primary"
              type="submit"
              :disabled="!valid"
              block
            >
              Save
            </v-btn>
          </v-col>
        </v-row>
  
        <v-row>
          <v-col cols="12" class="text-center">
            <p v-if="message">{{ message }}</p>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        valid: true,
        password: "",
        message: "",
        passwordRules: [
          v => !!v || 'Password is required',
          v => v.length >= 6 || 'Password must be at least 6 characters',
        ],
      };
    },
    methods: {
      async handleSubmit() {
        if (this.$refs.form.validate()) {
          try {
            const response = await axios.post("http://localhost:3000/api/auth/updatePassword", {
              password: this.password,
              token: this.$route.query.token
            });
            this.message = response.data.message;
            this.$router.push("/login");
          } catch (err) {
            console.error(err);
            this.message = "An error occurred while updating the password.";
          }
        }
      },
      clear() {
        this.$refs.form.reset();
      }
    }
  };
  </script>
  
  <style scoped>
  .title {
    text-align: center;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .cta-btn {
    font-weight: bold;
    text-transform: uppercase;
  }
  
  .container {
    max-width: 400px;
    margin: 0 auto;
    margin-top: 2em;
  }
  
  </style>
  