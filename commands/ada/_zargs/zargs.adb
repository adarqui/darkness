with Ada.Command_Line; use Ada.Command_Line;
with Ada.Text_IO; use Ada.Text_IO;

procedure Zargs is
begin

  for index in 1..Argument_Count loop
    Put(Argument(index));
    New_Line;
  end loop;

end;
