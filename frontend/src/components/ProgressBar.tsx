interface ProgressBarProps {
    progress: number;
}

export function ProgressBar({progress}: ProgressBarProps){
    let colorClass = "bg-green-500"
    if (progress < 30) colorClass = "bg-yellow-500"

    return(
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
                data-testid="progress-fill"
                className={`${colorClass}`}
            >

            </div>
        </div>
    )

}