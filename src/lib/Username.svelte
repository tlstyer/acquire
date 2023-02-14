<svelte:options immutable />

<script lang="ts">
  export let username: string;
</script>

<span>{username}</span>

<style>
  span {
    background-color: #d3d3d3;
  }
</style>
