void DrawRectangleBuffer(int x, int y)
{
    Graphics g = panel1.CreateGraphics();
    BufferedGraphicsContext currentContext = BufferedGraphicsManager.Current;
    BufferedGraphics bufg = currentContext.Allocate(g,
        new Rectangle(0, 0, panel1.Width, panel1.Height));
    Graphics newG = bufg.Graphics;
    newG.Clear(Color.Black);
    Rectangle rect = new Rectangle(x, y, 30, 30);
    Bitmap bm = panel1.BackgroundImage as Bitmap;
    newG.DrawImage(bm, new Rectangle(0, 0, panel1.Width, panel1.Height));
    newG.DrawRectangle(new Pen(new SolidBrush(Color.White),3), rect);
    bufg.Render(g);
}
