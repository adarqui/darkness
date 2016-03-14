with Ada.Text_IO; use Ada.Text_IO;
with Ada.Command_Line; use Ada.Command_Line;

procedure Argc is
begin

  Put_Line(Integer'Image(Argument_Count));

end;
