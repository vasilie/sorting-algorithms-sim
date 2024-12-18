function isMouseInItem(mouseX, mouseY, item) {
  return (
    mouseX >= item.x &&
    mouseX <= item.x + item.width &&
    mouseY >= item.y &&
    mouseY <= item.y + item.height
  );
}
const canvas = document.getElementById("main-canvas");

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  items.forEach((item) => {
    if (isMouseInItem(mouseX, mouseY, item)) {
      isDragging = true;
      draggedItem = item;
      offsetX = mouseX - item.x;
      offsetY = mouseY - item.y;
    }
  });
});
