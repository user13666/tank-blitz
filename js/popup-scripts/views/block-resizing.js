const contentBlocks = document.querySelectorAll('.content');
document.getElementById('menu-toggle').onchange = event => {
  if (!event.target.checked && event.target.checked !== undefined) {
    contentBlocks.forEach(contentBlock => {
      contentBlock.classList.add('content-nav-is-open');
    });
  } else {
    contentBlocks.forEach(contentBlock => {
      contentBlock.classList.remove('content-nav-is-open');
    });
  }
};
