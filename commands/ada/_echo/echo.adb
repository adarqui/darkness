with Ada.Command_Line; use Ada.Command_Line;
with Ada.Text_IO; use Ada.Text_IO;

procedure Echo is
begin

  for index in 1..Argument_Count loop
    Put(Argument(index));
    if index /= Argument_Count
    then
      Put(" ");
    end if;
  end loop;

  New_Line;

end;
