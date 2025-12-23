import React from "react";
import { Card } from "flowbite-react";

function InfoCard({ title, change, value,children: icon }) {
  return (
    <Card className="shadow-md border dark:border-gray-500  dark:hover:bg-gray-700 border-gray-200 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-50 text-sm">{title}</p>
          <p className="text-xl text-gray-600 dark:text-gray-50 mt-2">
            {value}
          </p>
          <p className="text-gray-400 text-sm dark:text-gray-50 mt-2">
            {change}
          </p>
        </div>
        {icon}
      </div>
    </Card>
  );
}

export default InfoCard;
