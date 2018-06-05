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

public class Vector
    {
        public double X { get; set; }
        public double Y { get; set; }
        public double Length
        {
            get
            {
                return Math.Sqrt(X * X + Y * Y);
            }
        }

        public static double operator * (Vector v1,Vector v2)
        {
            return v1.X * v2.Y - v1.Y * v2.X;
        }

        public Vector(double x,double y)
        {
            X = x;
            Y = y;
        }

        public double Angle(Vector v)
        {
            double pot = X * v.X + Y * v.Y;
            double theta = Math.Acos(pot / (Length * v.Length));
            double cross = this * v;
            if(cross<0)
            {
                theta = 2 * Math.PI - theta;
            }
            return theta*180/Math.PI;
        }
    }
