"use client";

import CustomTable from "@/app/components/table/CustomTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import useFetchClasses from "@/hooks/useFetchClasses";
import { ResultType } from "@/lib/TypeOF";
import { markSheet } from "@/utils/fetchStudent";
import React, {useState } from "react";

export default function Page() {
  const [studentId, setStudentId] = useState<string>("");
  const [result, setResult] = useState<ResultType | null>(null);
  const {classObject} = useFetchClasses();
  const [classId, setClassId] = useState<string>("");
  const { toast } = useToast();

  const handleMarks = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentId(e.target.value);
  };

  async function getMarks() {
    if (studentId.length === 0 || classId.length === 0) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await markSheet(studentId,classId);
      if (response.success) {
        setResult(response.success);
      }else if(response.error){
        toast({
          title: "Failure",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failure",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  if (result) {
    // Transform MarksType data into string[][]
    const rowList: string[][] = result.marks.map((mark) => [
      mark.subject_title,
      mark.subject_code,
      mark.subject_credit,
      mark.mark.toString(),
    ]);

    return (
      <div className="w-full  md:w-[500px] mx-auto">
        <h1 className="mb-4 text-center text-3xl text-violet-500 font-semibold animate-pulse">
          Mark Sheet
        </h1>
        <div className="flex flex-col p-4 text-xl text-violet-800 rounded-md border-2 border-violet-500">
          <div className="flex justify-between">
            <h1>Name: {result.student.name}</h1>
            
            <h1>ID: {result.student.student_id}</h1>
          </div>
          <div className="flex justify-between">
            <h1>Class: {result.student.class}</h1>
          </div>
        </div>

        <CustomTable
          headerList={["Subject", "Code", "Credit", "Marks"]}
          rowList={rowList}
          total={result.student.total_marks}
        />
      </div>
    );
  } else {
    return (
      <div className="w-[280px] mx-auto items-center">
        <Card>
          <CardHeader>
            <h1>Type your student ID</h1>
          </CardHeader>
          <CardContent>
            <label>Class</label>
            <select
              className="w-full p-2 border-2 border-violet-500 rounded-md"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">Select Class  {classId}</option>
              {classObject.map((klass) =>
                klass.result_published && (
                  <option key={klass.id} value={klass.id}>
                    {klass.full_klass}
                  </option>
                )
              )}
            </select>
            <label className="mt-3" >Student ID</label>
            <Input type="text" value={studentId} onChange={handleMarks}
            className="w-full p-2 border-2 border-violet-500 rounded-md"
             />
            <Button className="mt-4" onClick={getMarks}>
              Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
